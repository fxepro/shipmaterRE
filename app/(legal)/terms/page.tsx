import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Use' };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">Legal</p>
        <h1 className="mt-2 text-4xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
          Terms of Use
        </h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">Last updated: June 2, 2026</p>
      </div>

      <Section title="1. Acceptance">
        <p>By creating an account or using Shipmater (&quot;Platform&quot;), you agree to these Terms of Use (&quot;Terms&quot;). If you do not agree, do not use the Platform. These Terms apply to all users — shippers, carriers, receivers, and administrators.</p>
      </Section>

      <Section title="2. Eligibility">
        <p>You must be at least 18 years old, legally authorised to operate a business in your jurisdiction, and capable of forming a binding contract. Carriers must hold all licences, permits, and insurance required by applicable law before accepting any job through the Platform.</p>
      </Section>

      <Section title="3. Account Responsibilities">
        <ul>
          <li>You are responsible for keeping your login credentials secure. Do not share your password.</li>
          <li>You are liable for all activity that occurs under your account.</li>
          <li>You must provide accurate and current information at registration and keep it updated.</li>
          <li>We may suspend or terminate accounts that violate these Terms or are used fraudulently.</li>
        </ul>
      </Section>

      <Section title="4. Shipper Obligations">
        <ul>
          <li>Provide accurate freight descriptions, weights, dimensions, and hazmat classifications.</li>
          <li>Ensure freight is lawfully permitted to be transported and properly packaged for shipment.</li>
          <li>Honour accepted bids and contracted job assignments.</li>
          <li>Pay all agreed costs promptly through the Platform.</li>
        </ul>
      </Section>

      <Section title="5. Carrier Obligations">
        <ul>
          <li>Maintain valid DOT authority, commercial vehicle insurance, and all required licences throughout engagement on the Platform.</li>
          <li>Only bid on or accept jobs you have the capacity and legal authority to complete.</li>
          <li>Update GPS location as required during active shipments.</li>
          <li>Provide photographic proof of delivery where requested.</li>
          <li>Under contracted arrangements, carriers are expected to accept jobs in accordance with the contract terms; repeated declines may constitute breach of contract.</li>
        </ul>
      </Section>

      <Section title="6. Payments & Escrow">
        <p>Payments are processed via Stripe. When a bid is accepted or a contracted job is assigned, the agreed amount is held in escrow. Funds are released to the carrier upon confirmed delivery. Shipmater charges a platform fee deducted from each transaction. Fees are displayed before job creation. All fees are non-refundable except as set out in Section 7.</p>
      </Section>

      <Section title="7. Disputes">
        <p>Either party may raise a dispute within 72 hours of a delivery event. Shipmater will review evidence submitted by both parties and issue a decision within 10 business days. Our decision is final with respect to escrow release. Shipmater is not liable for any losses arising from disputes between shippers and carriers.</p>
      </Section>

      <Section title="8. Prohibited Conduct">
        <ul>
          <li>Using the Platform to transport prohibited, illegal, or undeclared hazardous goods.</li>
          <li>Attempting to circumvent the Platform by arranging payment outside of Shipmater after an introduction through the Platform.</li>
          <li>Posting false reviews, ratings, or carrier credentials.</li>
          <li>Interfering with the Platform&apos;s technical operation or attempting unauthorised access.</li>
          <li>Harassment, abuse, or threatening behaviour toward other users.</li>
        </ul>
      </Section>

      <Section title="9. Intellectual Property">
        <p>All Platform software, design, trademarks, and content are owned by or licensed to Shipmater. You may not copy, reproduce, or create derivative works without our written consent. You grant us a non-exclusive licence to use content you submit (shipment data, documents, photos) solely to provide the service.</p>
      </Section>

      <Section title="10. Disclaimers & Limitation of Liability">
        <p>The Platform is provided &quot;as is&quot;. We do not guarantee the accuracy of carrier credentials, GPS data, or delivery times. To the maximum extent permitted by law, Shipmater&apos;s total liability for any claim is limited to the fees paid by you to Shipmater in the three months preceding the event giving rise to the claim. We are not liable for indirect, consequential, or punitive damages.</p>
      </Section>

      <Section title="11. Indemnification">
        <p>You agree to indemnify and hold harmless Shipmater, its directors, employees, and agents from any claims, losses, or expenses (including legal fees) arising from your use of the Platform, your breach of these Terms, or your violation of any third-party rights.</p>
      </Section>

      <Section title="12. Termination">
        <p>You may delete your account at any time. We may suspend or terminate your access for breach of these Terms, legal reasons, or at our discretion with 30 days&apos; notice (or immediately for serious violations). Outstanding obligations (including payments) survive termination.</p>
      </Section>

      <Section title="13. Governing Law">
        <p>These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles. Disputes shall be resolved by binding arbitration under AAA rules, except either party may seek injunctive relief in any competent court.</p>
      </Section>

      <Section title="14. Changes to Terms">
        <p>We may update these Terms at any time. Material changes will be notified 14 days in advance. Continued use constitutes acceptance.</p>
      </Section>

      <Section title="15. Contact">
        <p>Shipmater · <a href="mailto:legal@shipmater.com" className="text-[var(--color-teal)] hover:underline">legal@shipmater.com</a></p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-[var(--color-slate)]">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-[var(--color-text-muted)] [&_ul]:space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-[var(--color-text)]">
        {children}
      </div>
    </section>
  );
}
