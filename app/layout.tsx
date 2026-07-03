import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Self-hosted, preloaded, crisp. Only Roboto's REAL weights — it has no 600,
// so requesting 600 would force a blurry faux-bold. Use 400/500/700.
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Shipmater', template: '%s · Shipmater' },
  description: 'Freight tracking made simple.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
