const SECTION_STYLE = { marginBottom: 28 };
const HEADING_STYLE = { color: 'var(--color-blue)' };
const BODY_STYLE = { color: '#4b5a6a' };
const LIST_STYLE = { color: '#4b5a6a', paddingLeft: 20, margin: '8px 0 0' };

export default function Privacy() {
  return (
    <div className="container" style={{ padding: '60px 0', maxWidth: 760, margin: '0 auto' }}>
      <h1 className="page-title">Privacy Policy</h1>
      <p style={{ color: '#8ea0b6' }}>Last Updated: July 19, 2026</p>
      <p style={BODY_STYLE}>
        ArabiKids ("ArabiKids," "we," "us," or "our") operates an online subscription platform that
        teaches Arabic language and Quranic concepts to children. This Privacy Policy explains how we
        collect, use, and protect information when you use our website and services (the "Service").
      </p>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>1. Information We Collect</h3>
        <p style={BODY_STYLE}><strong>From Parents/Guardians (Account Holders):</strong></p>
        <ul style={LIST_STYLE}>
          <li>Name, email address, and password</li>
          <li>Billing information (processed securely by Stripe, Billplz, or ToyyibPay — we do not store full card numbers)</li>
          <li>Country/region</li>
        </ul>
        <p style={{ ...BODY_STYLE, marginTop: 16 }}><strong>About Child Learners:</strong></p>
        <ul style={LIST_STYLE}>
          <li>First name or nickname, age or age group (Junior 3–7 / Explorer 8–17)</li>
          <li>Lesson progress, quiz results, and activity within the platform</li>
        </ul>
        <p style={{ ...BODY_STYLE, marginTop: 16 }}>
          We do not knowingly collect information directly from children beyond what a parent provides
          during account setup, and children do not have independent accounts.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>2. How We Use Information</h3>
        <ul style={LIST_STYLE}>
          <li>To create and manage accounts and subscriptions</li>
          <li>To deliver and personalize lessons and track progress</li>
          <li>To process payments and send billing receipts</li>
          <li>To communicate updates, support responses, and (with consent) marketing</li>
          <li>To improve the platform and troubleshoot issues</li>
        </ul>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>3. Children's Privacy</h3>
        <p style={BODY_STYLE}>
          ArabiKids is designed for use by children under parental supervision. Accounts are created and
          managed by a parent or guardian. We do not knowingly collect personal information directly from
          a child without verifiable parental consent. Parents may review, update, or request deletion of
          their child's information at any time by contacting us (see Section 9).
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>4. How We Share Information</h3>
        <p style={BODY_STYLE}>We do not sell personal information. We share information only with:</p>
        <ul style={LIST_STYLE}>
          <li>Payment processors (Stripe, Billplz, ToyyibPay) to complete transactions</li>
          <li>Service providers who help us operate the platform (hosting, analytics, email delivery), bound by confidentiality obligations</li>
          <li>Authorities, if required by law</li>
        </ul>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>5. Data Storage and Security</h3>
        <p style={BODY_STYLE}>
          Data is stored on secure servers with industry-standard safeguards (encryption in transit,
          access controls). No system is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>6. Cookies</h3>
        <p style={BODY_STYLE}>
          We use cookies and similar technologies to keep you logged in, remember preferences, and
          understand platform usage. You can control cookies through your browser settings.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>7. Your Rights</h3>
        <p style={BODY_STYLE}>
          Depending on your location, you may have the right to access, correct, export, or delete your
          personal information, and to withdraw consent for marketing communications. Contact us to
          exercise these rights.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>8. Data Retention</h3>
        <p style={BODY_STYLE}>
          We retain account and progress data for as long as your subscription is active, and for a
          reasonable period afterward for legal, billing, and support purposes, unless you request earlier
          deletion.
        </p>
      </section>

      <section style={SECTION_STYLE}>
        <h3 style={HEADING_STYLE}>9. Contact Us</h3>
        <p style={BODY_STYLE}>
          Questions about this Privacy Policy or your data: <strong>ArabiKidsApp@gmail.com</strong>
        </p>
      </section>

      <section>
        <h3 style={HEADING_STYLE}>10. Changes to This Policy</h3>
        <p style={BODY_STYLE}>
          We may update this Privacy Policy from time to time. Material changes will be notified via email
          or a notice on the Service. Continued use after changes constitutes acceptance.
        </p>
      </section>
    </div>
  );
}
