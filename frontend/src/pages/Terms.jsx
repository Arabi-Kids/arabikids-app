const SECTION_STYLE = { marginBottom: 28 };
const HEADING_STYLE = { color: 'var(--color-blue)' };
const BODY_STYLE = { color: '#4b5a6a' };
const LIST_STYLE = { color: '#4b5a6a', paddingLeft: 20, margin: '8px 0 0' };

export default function Terms() {
  return (
    <div className="container" style={{ padding: '60px 0', maxWidth: 760, margin: '0 auto' }}>
      <h1 className="page-title">Terms of Use</h1>
      <p style={{ color: '#8ea0b6' }}>Last Updated: July 19, 2026</p>
      <p style={BODY_STYLE}>
        Welcome to ArabiKids. By creating an account or using our website and services (the "Service"),
        you agree to these Terms of Use ("Terms"). If you do not agree, please do not use the Service.
      </p>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>1. Eligibility</h3>
        <p style={BODY_STYLE}>
          The Service is intended for use by parents and guardians on behalf of children. You must be at
          least 18 years old (or the age of majority in your jurisdiction) to create an account. By
          creating a child profile, you confirm you are the child's parent or legal guardian, or have
          authorization to act on their behalf.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>2. Account Registration</h3>
        <p style={BODY_STYLE}>
          You are responsible for maintaining the confidentiality of your login credentials and for all
          activity under your account. Notify us immediately of any unauthorized use.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>3. Subscriptions and Payment</h3>
        <ul style={LIST_STYLE}>
          <li>ArabiKids offers free lessons (5 per curriculum group) and paid subscriptions (monthly/annual) unlocking the full curriculum.</li>
          <li>Prices are listed in USD (or local currency where applicable) and are subject to change with notice.</li>
          <li>Subscriptions automatically renew unless cancelled before the renewal date.</li>
          <li>Payments are processed by third-party providers (Stripe, Billplz, ToyyibPay). We do not store full payment card details.</li>
          <li>Refunds, where applicable, are governed by our refund practices as stated at checkout or upon request.</li>
        </ul>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>4. License to Use</h3>
        <p style={BODY_STYLE}>
          We grant you a limited, non-exclusive, non-transferable license to access the Service for
          personal, non-commercial, family educational use. You may not copy, redistribute, resell, or
          publicly share lesson content.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>5. User Conduct</h3>
        <p style={BODY_STYLE}>You agree not to:</p>
        <ul style={LIST_STYLE}>
          <li>Share account credentials outside your household</li>
          <li>Attempt to reverse-engineer, scrape, or resell platform content</li>
          <li>Use the Service for any unlawful purpose or in a way that disrupts the platform</li>
        </ul>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>6. Intellectual Property</h3>
        <p style={BODY_STYLE}>
          All lesson content, curriculum design, branding, and platform materials are the property of
          ArabiKids and protected by copyright and other intellectual property laws. No rights are
          transferred to you except the limited license in Section 4.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>7. Educational Content Disclaimer</h3>
        <p style={BODY_STYLE}>
          ArabiKids provides supplementary Arabic and Quranic educational content. We do not guarantee
          specific learning outcomes and the Service is not a substitute for formal Islamic scholarship or
          certified Arabic instruction where required.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>8. Termination</h3>
        <p style={BODY_STYLE}>
          We may suspend or terminate accounts that violate these Terms. You may cancel your subscription
          at any time; cancellation stops future billing but does not automatically refund the current
          billing period unless otherwise stated.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>9. Limitation of Liability</h3>
        <p style={BODY_STYLE}>
          To the maximum extent permitted by law, ArabiKids is not liable for indirect, incidental, or
          consequential damages arising from use of the Service. The Service is provided "as is" without
          warranties of any kind.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>10. Changes to the Service or Terms</h3>
        <p style={BODY_STYLE}>
          We may update these Terms or modify/discontinue features of the Service at any time. Continued
          use after changes constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>11. Governing Law</h3>
        <p style={BODY_STYLE}>
          These Terms are governed by the laws of{' '}
          <strong style={{ color: '#c0392b' }}>[Jurisdiction to be confirmed]</strong>, without regard to
          conflict of law principles.
        </p>
      </section>

      <section>
        <h3 style={HEADING_STYLE}>12. Contact Us</h3>
        <p style={BODY_STYLE}><strong>ArabiKidsApp@gmail.com</strong></p>
      </section>
    </div>
  );
}
