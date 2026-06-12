import Link from 'next/link';

const B = {
  teal:     '#90E0EF',
  tealDark: '#0096C7',
  darkCard: '#0A1520',
  white:    '#FFFFFF',
};
const IBM = "'IBM Plex Sans', system-ui, sans-serif";

const COLS = [
  {
    heading: 'Product',
    links: [
      ['Features',   '/features'],
      ['Use Cases',  '/use-cases'],
      ['Blog',       '/blog'],
    ],
  },
  {
    heading: 'Solutions',
    links: [
      ['For Shippers', '/shippers'],
      ['For Carriers', '/carriers'],
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
    heading: 'Trust & Safety',
    links: [
      ['Platform Compliance',   '/compliance'],
      ['Carrier Requirements',  '/provider-compliance'],
      ['Verification',          '/verification'],
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
    <footer style={{ background: B.darkCard, borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: IBM }}>
      <div className="mx-auto max-w-[1200px] px-6 py-14">

        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-10 mb-12">
          <div>
            <p style={{ fontWeight: 700, fontSize: 20, color: B.white, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shipmater</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginTop: 6, maxWidth: 200, lineHeight: 1.6 }}>
              Dispatch · Live Tracking · Safe Carry
            </p>
          </div>

          <div className="flex flex-wrap gap-10">
            {COLS.map(({ heading, links }) => (
              <div key={heading}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 12 }}>
                  {heading}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {links.map(([label, href]) => (
                    <Link key={href} href={href}
                      style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}
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
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>© 2026 Shipmater. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }} className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"   style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }} className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }} className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
