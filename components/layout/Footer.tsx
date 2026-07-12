import Link from 'next/link';
import { INDUSTRIES } from '@/lib/marketing/industries';

const B = {
  teal:     '#90E0EF',
  tealDark: '#0096C7',
  darkCard: '#0A1520',
  white:    '#FFFFFF',
};
const BODY = 'var(--font-body)';
const DISPLAY = 'var(--font-display)';

const COLS = [
  {
    heading: 'Product',
    links: [
      ['How It Works', '/how-it-works'],
      ['Use Cases',    '/use-cases'],
      ['Industries',   '/industries'],
      ['Blog',         '/blog'],
      ['Pricing',      '/pricing'],
      ['Platform',     '/platform'],
    ],
  },
  {
    heading: 'Industries',
    links: INDUSTRIES.map((i) => [i.title, `/industries/${i.slug}`] as [string, string]),
  },
  {
    heading: 'Solutions',
    links: [
      ['For Shippers',  '/shippers'],
      ['For Carriers',  '/carriers'],
      ['Carrier Trust', '/carrier-trust'],
    ],
  },
  {
    heading: 'International',
    links: [
      ['Global Coverage',         '/global'],
      ['USMCA (US · CA · MX)',    '/usmca'],
      ['Country Coverage Table',  '/coverage'],
      ['International Carriers',  '/international-carriers'],
    ],
  },
  {
    heading: 'Account',
    links: [
      ['Sign in',  '/login'],
      ['Register', '/register'],
    ],
  },
  {
    heading: 'Legal',
    links: [
      ['Privacy Policy', '/privacy'],
      ['Terms of Use',   '/terms'],
      ['Cookie Policy',  '/cookies'],
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: B.darkCard, borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: BODY }}>
      <div className="mx-auto max-w-[1200px] px-6 py-14">

        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-10 mb-12">
          <div>
            <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'var(--text-h5)', lineHeight: 'var(--lh-h5)', color: B.white, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shipmater</p>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.38)', marginTop: 6, maxWidth: 200, lineHeight: 1.6 }}>
              Dispatch · Live Tracking · Safe Carry
            </p>
          </div>

          <div className="flex flex-wrap gap-10">
            {COLS.map(({ heading, links }) => (
              <div key={heading}>
                <p style={{ fontSize: 'var(--text-caption)', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 12, lineHeight: 1.5 }}>
                  {heading}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {links.map(([label, href]) => (
                    <Link key={href} href={href}
                      style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.50)', textDecoration: 'none', lineHeight: 1.6 }}
                      className="hover:text-white transition-colors">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 'var(--text-fine)', color: 'rgba(255,255,255,0.28)', lineHeight: 1.5 }}>© 2026 Shipmater. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/privacy" style={{ fontSize: 'var(--text-fine)', color: 'rgba(255,255,255,0.28)', textDecoration: 'none', lineHeight: 1.5 }} className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"   style={{ fontSize: 'var(--text-fine)', color: 'rgba(255,255,255,0.28)', textDecoration: 'none', lineHeight: 1.5 }} className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" style={{ fontSize: 'var(--text-fine)', color: 'rgba(255,255,255,0.28)', textDecoration: 'none', lineHeight: 1.5 }} className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
