import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-cream-dark)] bg-[var(--color-white)]">
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <span
          className="text-sm font-semibold text-[var(--color-slate)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Shipmater
        </span>

        <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
          <Link href="/privacy" className="hover:text-[var(--color-teal)] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[var(--color-teal)] transition-colors">
            Terms of Use
          </Link>
          <Link href="/cookies" className="hover:text-[var(--color-teal)] transition-colors">
            Cookie Policy
          </Link>
        </div>

        <p className="text-xs text-[var(--color-text-faint)]">
          © {year} Shipmater. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
