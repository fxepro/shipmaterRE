import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">Legal</p>
        <h1 className="mt-2 text-4xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">Last updated: June 2, 2026</p>
      </div>

      <Section title="1. Who We Are">
        <p>Shipmater (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates a freight management platform connecting shippers and carriers. Our registered address and contact details are available at the bottom of this page. For any privacy-related enquiries, email <a href="mailto:privacy@shipmater.com" className="text-[var(--color-teal)] hover:underline">privacy@shipmater.com</a>.</p>
      </Section>

      <Section title="2. Information We Collect">
        <ul>
          <li><strong>Account data</strong> — name, email address, phone number, company name, and role (shipper, carrier, or receiver) provided during registration.</li>
          <li><strong>Profile & compliance data</strong> — DOT number, MC number, insurance certificates, and other carrier verification documents you upload.</li>
          <li><strong>Shipment data</strong> — pickup and delivery addresses, item descriptions, weight, photos, and GPS coordinates generated during active shipments.</li>
          <li><strong>Payment data</strong> — payment method tokens processed through our payment provider (Stripe). We do not store raw card numbers or bank account numbers.</li>
          <li><strong>Usage data</strong> — pages visited, features used, device type, IP address, and browser information collected via server logs and analytics.</li>
          <li><strong>Communications</strong> — messages, dispute submissions, and support tickets you send us.</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <ul>
          <li>To create and manage your account and authenticate your sessions.</li>
          <li>To match shippers with carriers and facilitate job bidding and assignment.</li>
          <li>To display real-time GPS tracking to authorised parties on a shipment.</li>
          <li>To process payments, manage escrow, and handle payouts.</li>
          <li>To send transactional notifications (bid updates, pickup confirmations, delivery alerts).</li>
          <li>To investigate disputes and enforce our Terms of Use.</li>
          <li>To improve and secure the platform through aggregated analytics.</li>
          <li>To comply with legal obligations.</li>
        </ul>
      </Section>

      <Section title="4. Legal Basis for Processing (GDPR)">
        <p>Where applicable, we process your data under the following legal bases: <strong>contract performance</strong> (to provide the service you signed up for), <strong>legitimate interests</strong> (fraud prevention, platform security, analytics), <strong>legal obligation</strong> (tax, regulatory compliance), and <strong>consent</strong> (marketing communications — you may withdraw at any time).</p>
      </Section>

      <Section title="5. Sharing Your Information">
        <p>We do not sell your personal data. We share information only as follows:</p>
        <ul>
          <li><strong>Counterparties</strong> — shippers see carrier name, DOT/MC number, and rating; carriers see shipper name and shipment details.</li>
          <li><strong>Service providers</strong> — Stripe (payments), cloud hosting providers, email delivery services, and mapping APIs, each under appropriate data processing agreements.</li>
          <li><strong>Legal requirements</strong> — if required by law, court order, or to protect the rights and safety of users or the public.</li>
          <li><strong>Business transfers</strong> — in connection with a merger, acquisition, or sale of assets, subject to standard confidentiality obligations.</li>
        </ul>
      </Section>

      <Section title="6. Data Retention">
        <p>We retain your account data for as long as your account is active. After account deletion we retain records for up to 7 years where required for tax or legal compliance. GPS ping data older than 2 years is automatically purged. You may request earlier deletion by contacting us.</p>
      </Section>

      <Section title="7. Your Rights">
        <p>Depending on your jurisdiction you may have the right to access, correct, delete, restrict, or port your personal data, and to object to certain processing. To exercise any right, email <a href="mailto:privacy@shipmater.com" className="text-[var(--color-teal)] hover:underline">privacy@shipmater.com</a>. We will respond within 30 days. You also have the right to lodge a complaint with your local data protection authority.</p>
      </Section>

      <Section title="8. Security">
        <p>We use TLS encryption for all data in transit, bcrypt hashing for passwords, and role-based access controls. No transmission over the internet is completely secure; use our platform at your own risk and report any suspected security issues to <a href="mailto:security@shipmater.com" className="text-[var(--color-teal)] hover:underline">security@shipmater.com</a>.</p>
      </Section>

      <Section title="9. International Transfers">
        <p>Our servers are located in the United States. If you access Shipmater from outside the US, your data will be transferred to and processed in the US under appropriate safeguards.</p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>We may update this policy from time to time. Material changes will be notified by email or an in-app banner at least 14 days before they take effect. Continued use of Shipmater after that date constitutes acceptance of the revised policy.</p>
      </Section>

      <Section title="11. Contact">
        <p>Shipmater · <a href="mailto:privacy@shipmater.com" className="text-[var(--color-teal)] hover:underline">privacy@shipmater.com</a></p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-[var(--color-slate)]">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-[var(--color-text-muted)] [&_ul]:space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-[var(--color-text)] [&_a]:text-[var(--color-teal)]">
        {children}
      </div>
    </section>
  );
}
