import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cookie Policy' };

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">Legal</p>
        <h1 className="mt-2 text-4xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
          Cookie Policy
        </h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">Last updated: June 2, 2026</p>
      </div>

      <Section title="1. What Are Cookies">
        <p>Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences, keep you signed in, and understand how you use the service. We also use similar technologies such as local storage and session storage.</p>
      </Section>

      <Section title="2. Cookies We Use">
        <p>Shipmater uses the following categories of cookies:</p>

        <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-cream-dark)]">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--color-slate)] text-left text-[var(--color-sage-light)]">
                <th className="px-4 py-3 font-medium rounded-tl-xl">Category</th>
                <th className="px-4 py-3 font-medium">Purpose</th>
                <th className="px-4 py-3 font-medium rounded-tr-xl">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-cream-dark)] bg-[var(--color-white)]">
              <tr>
                <td className="px-4 py-3 font-semibold text-[var(--color-text)]">Essential</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">Authentication token storage, CSRF protection, and session management. Required for the Platform to function.</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">Session / persistent (up to 30 days)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-[var(--color-text)]">Functional</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">Remembering your UI preferences such as selected filters and map settings.</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">Up to 1 year</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-[var(--color-text)]">Analytics</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">Aggregated, anonymised usage statistics to help us improve the Platform. No personally identifiable information is shared with analytics providers.</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">Up to 2 years</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-[var(--color-text)] rounded-bl-xl">Third-party</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">Stripe sets cookies when you interact with payment forms to detect fraud and ensure secure checkout.</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] rounded-br-xl">Varies</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Local Storage">
        <p>In addition to cookies, Shipmater stores your authentication token in your browser&apos;s <code className="rounded bg-[var(--color-cream)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text)]">localStorage</code>. This is strictly necessary to keep you signed in across page reloads and cannot be disabled while using the Platform. It is cleared when you log out or clear your browser data.</p>
      </Section>

      <Section title="4. Your Choices">
        <p>You can control cookies through your browser settings:</p>
        <ul>
          <li><strong>Block all cookies</strong> — most browsers allow you to refuse cookies. Note that blocking essential cookies will prevent you from logging in.</li>
          <li><strong>Delete cookies</strong> — you can delete existing cookies via your browser&apos;s history or privacy settings.</li>
          <li><strong>Opt-out of analytics</strong> — contact us at <a href="mailto:privacy@shipmater.com" className="text-[var(--color-teal)] hover:underline">privacy@shipmater.com</a> to opt out of analytics tracking.</li>
        </ul>
        <p>Instructions for common browsers: <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[var(--color-teal)] hover:underline">Chrome</a> · <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-[var(--color-teal)] hover:underline">Firefox</a> · <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[var(--color-teal)] hover:underline">Safari</a> · <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406" target="_blank" rel="noopener noreferrer" className="text-[var(--color-teal)] hover:underline">Edge</a>.</p>
      </Section>

      <Section title="5. Third-Party Links">
        <p>Our Platform may contain links to third-party sites. This Cookie Policy does not apply to those sites. We encourage you to review their individual cookie and privacy policies.</p>
      </Section>

      <Section title="6. Changes to This Policy">
        <p>We may update this Cookie Policy at any time. Changes will be posted on this page with a revised &quot;Last updated&quot; date. Continued use of the Platform after changes constitutes your acceptance.</p>
      </Section>

      <Section title="7. Contact">
        <p>For questions about our use of cookies, email <a href="mailto:privacy@shipmater.com" className="text-[var(--color-teal)] hover:underline">privacy@shipmater.com</a>.</p>
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
