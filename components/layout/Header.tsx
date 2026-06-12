'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const B = {
  tealDark: '#0096C7',
  teal:     '#90E0EF',
  darkSec:  '#0A2E40',
  white:    '#FFFFFF',
};
const IBM = "'IBM Plex Sans', system-ui, sans-serif";

const NAV = [
  ['How It Works', '/how-it-works'],
  ['Use Cases',    '/use-cases'],
  ['Shippers',     '/shippers'],
  ['Carriers',     '/carriers'],
] as const;

export function Header() {
  const path = usePathname();

  return (
    <header style={{ background: B.darkSec, position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <Link href="/"
          style={{ fontFamily: IBM, fontWeight: 700, fontSize: 26, color: B.white, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
          Shipmater
        </Link>

        <nav className="flex items-center gap-7">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href}
              style={{
                fontFamily: IBM,
                fontSize: 16,
                fontWeight: path === href ? 600 : 400,
                color: path === href ? B.teal : 'rgba(255,255,255,0.70)',
                textDecoration: 'none',
              }}
              className="hidden md:block hover:text-white transition-colors">
              {label}
            </Link>
          ))}
          <Link href="/login"
            style={{ fontFamily: IBM, fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}
            className="hidden sm:block hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/register"
            style={{ background: B.tealDark, fontFamily: IBM, fontSize: 16, fontWeight: 600, color: B.white, padding: '9px 20px', borderRadius: 6, textDecoration: 'none' }}
            className="hover:opacity-90 transition-opacity">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
