import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-cream)]">
      <header className="border-b border-[var(--color-cream-dark)] bg-[var(--color-white)]">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold text-[var(--color-slate)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Shipmater
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
