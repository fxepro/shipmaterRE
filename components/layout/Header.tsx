'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { MegaMenuPanel, MENUS } from './MegaMenu';

const B = {
  tealDark: '#0096C7',
  teal:     '#90E0EF',
  darkSec:  '#0A2E40',
  white:    '#FFFFFF',
};
const ROBOTO = "'Roboto', 'IBM Plex Sans', system-ui, sans-serif";

const NAV: { label: string; href: string; menu?: string }[] = [
  { label: 'How It Works',  href: '/how-it-works',  menu: 'how-it-works'  },
  { label: 'Use Cases',     href: '/use-cases',     menu: 'use-cases'     },
  { label: 'Shippers',      href: '/shippers',      menu: 'shippers'      },
  { label: 'Carriers',      href: '/carriers',      menu: 'carriers'      },
  { label: 'International', href: '/global',        menu: 'international' },
  { label: 'Pricing',       href: '/pricing'                              },
];

export function Header() {
  const path = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(key);
  };

  // 400 ms — gives the mouse enough time to travel from the nav bar
  // down into the absolute panel without the menu snapping shut.
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 400);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    // Outer wrapper: sticky + carries the "leave header" close trigger
    <div
      style={{ position: 'sticky', top: 0, zIndex: 50 }}
      onMouseLeave={scheduleClose}
    >
      <header style={{ background: B.darkSec }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">

          {/* Wordmark */}
          <Link href="/"
            style={{
              fontFamily: ROBOTO, fontWeight: 700, fontSize: 26,
              color: B.white, letterSpacing: '0.08em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}>
            Shipmater
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-7">
            {NAV.map(({ label, href, menu }) => {
              const isActive = path === href || path.startsWith(href + '/');
              const isOpen   = activeMenu === menu;

              return menu ? (
                // Megamenu trigger
                <button
                  key={href}
                  onMouseEnter={() => openMenu(menu)}
                  style={{
                    alignItems: 'center',
                    gap:        4,
                    fontFamily: ROBOTO,
                    fontSize:   16,
                    fontWeight: isActive || isOpen ? 600 : 400,
                    color:      isActive || isOpen ? B.teal : 'rgba(255,255,255,0.70)',
                    background: 'none',
                    border:     'none',
                    cursor:     'pointer',
                    padding:    0,
                    transition: 'color 0.15s',
                  }}
                  className="hidden md:flex hover:!text-white"
                >
                  {label}
                  <ChevronDown
                    size={14}
                    style={{
                      transform:  isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      opacity:    0.7,
                    }}
                  />
                </button>
              ) : (
                <Link key={href} href={href}
                  style={{
                    fontFamily: ROBOTO, fontSize: 16,
                    fontWeight: isActive ? 600 : 400,
                    color:      isActive ? B.teal : 'rgba(255,255,255,0.70)',
                    textDecoration: 'none',
                  }}
                  className="hidden md:block hover:text-white transition-colors">
                  {label}
                </Link>
              );
            })}

            <Link href="/login"
              style={{ fontFamily: ROBOTO, fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}
              className="hidden sm:block hover:text-white transition-colors">
              Sign in
            </Link>

            <Link href="/register"
              style={{
                background: B.tealDark, fontFamily: ROBOTO, fontSize: 16,
                fontWeight: 600, color: B.white,
                padding: '9px 20px', borderRadius: 6, textDecoration: 'none',
              }}
              className="hover:opacity-90 transition-opacity">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Megamenu panel ────────────────────────────────────────────────────
          Rendered as a DOM child of the sticky wrapper so it receives pointer
          events correctly. onMouseEnter cancels the pending close; onMouseLeave
          re-arms it so leaving the panel also closes the menu.
      ──────────────────────────────────────────────────────────────────────── */}
      {activeMenu && MENUS[activeMenu] && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <MegaMenuPanel menuKey={activeMenu} />
        </div>
      )}
    </div>
  );
}
