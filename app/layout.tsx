import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { getTenantConfig } from '@/lib/tenant';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
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
    <html lang="en" className={roboto.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
