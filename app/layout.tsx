import type { Metadata } from 'next';
import { Source_Sans_3, Jost } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { getTenantConfig } from '@/lib/tenant';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-source-sans',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jost',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantConfig();
  const name   = tenant?.brand_name ?? 'Shipmater';
  return {
    title:       { default: name, template: `%s · ${name}` },
    description: `${name} — freight management platform`,
    icons:       { icon: tenant?.favicon_url ?? '/favicon.ico' },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${jost.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
