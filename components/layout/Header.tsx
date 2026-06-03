import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-cream-dark)] bg-[var(--color-white)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="text-xl font-semibold text-[var(--color-slate)] shrink-0"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Shipmater
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/features"   className="hidden sm:block text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Features</Link>
          <Link href="/industries" className="hidden sm:block text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors">Industries</Link>
          <Link href="/login"      className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Sign in</Link>
          <Link href="/register"   className="rounded-lg bg-[var(--color-slate)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-slate-80)] transition-colors">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
