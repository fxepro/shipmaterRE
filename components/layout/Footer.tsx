import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-cream-dark)] bg-[var(--color-white)]">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-8">

          <div>
            <span className="text-base font-semibold text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
              Shipmater
            </span>
            <p className="mt-1 text-xs text-[var(--color-text-faint)] max-w-[200px]">
              Freight tracking and dispatch, built for every role.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">Product</p>
              <div className="space-y-1.5">
                <Link href="/features"   className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Features</Link>
                <Link href="/industries" className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Industries</Link>
                <Link href="/blog"       className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Blog</Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">Solutions</p>
              <div className="space-y-1.5">
                <Link href="/shippers"  className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">For Shippers</Link>
                <Link href="/carriers"  className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">For Carriers</Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">Account</p>
              <div className="space-y-1.5">
                <Link href="/login"    className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Sign in</Link>
                <Link href="/register" className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Register</Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">Trust & Safety</p>
              <div className="space-y-1.5">
                <Link href="/compliance"          className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Platform Compliance</Link>
                <Link href="/provider-compliance" className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Carrier Requirements</Link>
                <Link href="/verification"        className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Verification</Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">Legal</p>
              <div className="space-y-1.5">
                <Link href="/privacy" className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Privacy Policy</Link>
                <Link href="/terms"   className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Terms of Use</Link>
                <Link href="/cookies" className="block text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-[var(--color-cream-dark)] pt-6">
          <p className="text-xs text-[var(--color-text-faint)]">© {year} Shipmater. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
