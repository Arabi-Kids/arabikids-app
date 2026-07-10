export default function Privacy() {
  return (
    <div className="container" style={{ padding: '60px 0', maxWidth: 760, margin: '0 auto' }}>
      <h1 className="page-title">Privacy Policy</h1>
      <p style={{ color: '#8ea0b6' }}>Last updated: 2026</p>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>1. Information We Collect</h3>
        <p style={{ color: '#4b5a6a' }}>
          When you create an ArabiKids account, we collect the parent's name and email address, your
          child's first name, and their selected age group. We also collect lesson progress data (scores
          and completion) to power the Progress page.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>2. How We Use Information</h3>
        <p style={{ color: '#4b5a6a' }}>
          We use this information to provide the ArabiKids service, track learning progress, process
          subscription payments through Stripe, and send account-related emails through Enginemailer.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>3. Payment Information</h3>
        <p style={{ color: '#4b5a6a' }}>
          Payment details are processed securely by Stripe. ArabiKids does not store your credit card
          information on our servers.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>4. Data Sharing</h3>
        <p style={{ color: '#4b5a6a' }}>
          We do not sell your personal information. Data is shared only with the service providers
          required to run ArabiKids (Stripe for payments, Enginemailer for email).
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>5. Children's Privacy</h3>
        <p style={{ color: '#4b5a6a' }}>
          ArabiKids accounts are created and managed by a parent or guardian. Children do not create
          their own accounts or provide personal information directly.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--color-blue)' }}>6. Your Rights</h3>
        <p style={{ color: '#4b5a6a' }}>
          You may request access to, correction of, or deletion of your account data at any time by
          contacting us at ArabiKidsApp@gmail.com.
        </p>
      </section>

      <section>
        <h3 style={{ color: 'var(--color-blue)' }}>7. Contact</h3>
        <p style={{ color: '#4b5a6a' }}>Questions about this policy? Email us at ArabiKidsApp@gmail.com.</p>
      </section>
    </div>
  );
}
