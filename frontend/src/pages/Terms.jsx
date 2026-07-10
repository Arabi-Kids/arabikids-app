export default function Terms() {
  return (
    <div className="container" style={{ padding: '60px 0', maxWidth: 760, margin: '0 auto' }}>
      <h1 className="page-title">Terms of Use</h1>
      <p style={{ color: '#8ea0b6' }}>Last updated: 2026</p>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>1. Acceptance of Terms</h3>
        <p style={{ color: '#4b5a6a' }}>
          By creating an ArabiKids account, you agree to these Terms of Use and our Privacy Policy.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>2. Accounts</h3>
        <p style={{ color: '#4b5a6a' }}>
          ArabiKids accounts must be created and managed by a parent or legal guardian on behalf of a
          child. You are responsible for keeping your login credentials secure.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>3. Subscriptions & Billing</h3>
        <p style={{ color: '#4b5a6a' }}>
          ArabiKids offers a free plan (5 lessons per age group) and paid Monthly ($9.99) and Annual
          ($89.99) subscriptions that unlock all 90 lessons. Subscriptions renew automatically until
          cancelled and are billed in USD through Stripe. You may cancel anytime from your Account page;
          cancellation takes effect at the end of the current billing period.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>4. Acceptable Use</h3>
        <p style={{ color: '#4b5a6a' }}>
          You agree not to share your account credentials, resell access, or use ArabiKids content for
          any purpose other than personal, non-commercial learning.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>5. Intellectual Property</h3>
        <p style={{ color: '#4b5a6a' }}>
          All lesson content, illustrations, and branding are the property of ArabiKids and may not be
          copied or redistributed without permission.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>6. Disclaimer</h3>
        <p style={{ color: '#4b5a6a' }}>
          ArabiKids is an educational supplement and is not a substitute for formal Arabic or Quranic
          instruction from a qualified teacher.
        </p>
      </section>

      <section>
        <h3 style={{ color: 'var(--color-blue)' }}>7. Contact</h3>
        <p style={{ color: '#4b5a6a' }}>Questions about these terms? Email us at ArabiKidsApp@gmail.com.</p>
      </section>
    </div>
  );
}
