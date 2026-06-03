import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-cream)]">
      <header className="border-b border-[var(--color-cream-dark)] bg-[var(--color-white)]">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-6">
          <Link
            href="/"
            className="text-lg font-semibold text-[var(--color-slate)] shrink-0"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Shipmater
          </Link>
          <nav className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
            <Link href="/features" className="hover:text-[var(--color-teal)] transition-colors">Features</Link>
            <Link href="/industries" className="hover:text-[var(--color-teal)] transition-colors">Industries</Link>
            <Link href="/login" className="rounded-lg bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] transition-colors">
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
