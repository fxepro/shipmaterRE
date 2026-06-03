import { Footer } from '@/components/layout/Footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-cream)]">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
