import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--color-teal)] shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="text-xl font-semibold text-white shrink-0"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Shipmater
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/features"   className="hidden sm:block text-sm font-medium text-white/80 hover:text-white transition-colors">Features</Link>
          <Link href="/industries" className="hidden sm:block text-sm font-medium text-white/80 hover:text-white transition-colors">Industries</Link>
          <Link href="/login"      className="text-sm font-medium text-white/80 hover:text-white transition-colors">Sign in</Link>
          <Link href="/register"   className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[var(--color-teal)] hover:bg-[var(--color-teal-pale)] transition-colors">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
