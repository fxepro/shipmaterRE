import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-cream)]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
