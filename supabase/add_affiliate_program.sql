-- Additive migration for the LIVE project - adds the affiliate program:
-- affiliates register themselves (a third, separate auth context alongside
-- the public site and admin portal - see frontend/src/lib/supabaseAffiliate.js),
-- get a referral code, and earn a recurring commission on their referred
-- customers' payments. Safe to run now even with real data - adds four new
-- tables and one column, touches nothing existing. Run once in the Supabase
-- SQL Editor.
--
-- Deliberately does NOT touch public.handle_new_user() (schema.sql:229-245),
-- even though affiliates get a real auth.users row via this same Supabase
-- Auth backend (only the storageKey differs, matching the existing public/
-- admin split). That trigger fires on every signup, customer and admin
-- alike - special-casing affiliates inside it would be the single
-- highest-blast-radius change available in this feature. Instead, affiliate
-- signups get a harmless, unused public.users row (role defaults to
-- 'parent', never read - affiliates authenticate through their own client/
-- storageKey and their real profile lives in public.affiliates below). The
-- only consequence is admin's aggregate customer stats/lists need to
-- exclude these rows - handled in frontend/src/lib/adminDb.js, not here.

create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  country text not null,
  payout_method text not null check (payout_method in ('paypal', 'bank_transfer')),
  paypal_email text,
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  referral_code text not null unique,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint affiliates_payout_fields_match_method check (
    (payout_method = 'paypal' and paypal_email is not null)
    or (payout_method = 'bank_transfer' and bank_name is not null and bank_account_number is not null and bank_account_holder is not null)
  )
);

create index idx_affiliates_referral_code on public.affiliates(referral_code);
create index idx_affiliates_auth_user on public.affiliates(auth_user_id);

-- One referral relationship per customer, ever (customer_id unique) - a
-- customer is attributed to exactly one affiliate, permanently, even if
-- they later cancel and resubscribe. commission_tier_at_signup stores the
-- resolved RATE (not a tier label) so it's frozen at creation and can never
-- be retroactively repriced by a future rate-table edit - this is what
-- makes tier changes "forward-only" per the business rules.
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  customer_id uuid not null unique references public.users(id) on delete cascade,
  commission_tier_at_signup numeric not null check (commission_tier_at_signup in (0.10, 0.15, 0.20)),
  commission_start_date timestamptz,
  cap_expires_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'active', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_referrals_affiliate on public.referrals(affiliate_id);
create index idx_referrals_customer on public.referrals(customer_id);
create index idx_referrals_status on public.referrals(status);

-- One row per successful payment that earned commission. stripe_invoice_id
-- is unique so Stripe's at-least-once webhook redelivery can never double-pay
-- the same invoice - a repeat insert just hits the unique violation and is
-- ignored by the webhook handler. affiliate_id is denormalized from
-- referral_id purely so the monthly rollup and admin "commission owed"
-- views are a single-table group-by with no join.
create table public.commission_events (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  stripe_invoice_id text not null unique,
  amount_paid_cents int not null,
  commission_rate_applied numeric not null,
  commission_amount_cents int not null,
  invoice_paid_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index idx_commission_events_affiliate on public.commission_events(affiliate_id);
create index idx_commission_events_referral on public.commission_events(referral_id);
create index idx_commission_events_paid_at on public.commission_events(invoice_paid_at);

-- One row per affiliate per calendar month, populated by the monthly
-- scheduled job (netlify/functions/compute-affiliate-commissions.js) from
-- commission_events, and updated by admin when a payout is actually sent.
create table public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  period_month date not null,
  amount_cents int not null,
  status text not null default 'pending' check (status in ('pending', 'sent')),
  sent_at timestamptz,
  marked_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  unique (affiliate_id, period_month)
);

create index idx_affiliate_payouts_affiliate on public.affiliate_payouts(affiliate_id);

alter table public.users add column if not exists referral_code_used text;

-- ---------------------------------------------------------------------------
-- RLS helper + upsert function
-- ---------------------------------------------------------------------------

create or replace function public.current_affiliate_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.affiliates where auth_user_id = auth.uid();
$$;

-- Used by the monthly scheduled job - safely re-runnable (recomputes a
-- month's total from commission_events each run) without ever overwriting
-- a payout that's already been marked 'sent' to the affiliate.
create or replace function public.upsert_affiliate_payout(p_affiliate_id uuid, p_period date, p_amount_cents int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.affiliate_payouts (affiliate_id, period_month, amount_cents)
  values (p_affiliate_id, p_period, p_amount_cents)
  on conflict (affiliate_id, period_month) do update
    set amount_cents = excluded.amount_cents
    where affiliate_payouts.status = 'pending';
end;
$$;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.affiliates enable row level security;
alter table public.referrals enable row level security;
alter table public.commission_events enable row level security;
alter table public.affiliate_payouts enable row level security;

create policy "affiliates_select" on public.affiliates for select
  using (auth_user_id = auth.uid() or public.is_admin());
create policy "affiliates_insert_self" on public.affiliates for insert
  with check (auth_user_id = auth.uid());
create policy "affiliates_update" on public.affiliates for update
  using (auth_user_id = auth.uid() or public.is_admin())
  with check (auth_user_id = auth.uid() or public.is_admin());
create policy "affiliates_admin_all" on public.affiliates for all
  using (public.is_admin()) with check (public.is_admin());

-- referrals/commission_events/affiliate_payouts are select-only for the
-- owning affiliate - only the service role (webhook, scheduled job) and
-- admin ever write them, matching how push_subscriptions' writer
-- (send-streak-reminders.js) bypasses RLS entirely via the service key.
create policy "referrals_select" on public.referrals for select
  using (affiliate_id = public.current_affiliate_id() or public.is_admin());
create policy "referrals_admin_all" on public.referrals for all
  using (public.is_admin()) with check (public.is_admin());

create policy "commission_events_select" on public.commission_events for select
  using (affiliate_id = public.current_affiliate_id() or public.is_admin());
create policy "commission_events_admin_all" on public.commission_events for all
  using (public.is_admin()) with check (public.is_admin());

create policy "affiliate_payouts_select" on public.affiliate_payouts for select
  using (affiliate_id = public.current_affiliate_id() or public.is_admin());
create policy "affiliate_payouts_admin_all" on public.affiliate_payouts for all
  using (public.is_admin()) with check (public.is_admin());
