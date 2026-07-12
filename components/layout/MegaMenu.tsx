'use client';

import Link from 'next/link';
import {
  Package, MapPin, ShieldCheck, ClipboardList,
  Briefcase, DollarSign, Globe, UserCircle2, Lock,
  Globe2, Flag, Table2,
  ArrowRight, type LucideIcon,
} from 'lucide-react';
import { INDUSTRIES } from '@/lib/marketing/industries';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:      '#0A2E40',
  primary:   '#0096C7',
  surface:   '#F0F4F7',
  iconBg:    '#E0F4FA',
  white:     '#FFFFFF',
  text:      '#1A2B3C',
  muted:     '#64748B',
  border:    '#E2ECF0',
};
const BODY = 'var(--font-body)';
const DISPLAY = 'var(--font-display)';

interface MenuItem {
  icon:  LucideIcon;
  title: string;
  desc:  string;
  href:  string;
}

interface MenuConfig {
  heading: string;
  items:   MenuItem[];
  cta:     { label: string; href: string };
}

// ── One card → one page ───────────────────────────────────────────────────────
export const MENUS: Record<string, MenuConfig> = {

  'how-it-works': {
    heading: 'How It Works',
    items: [
      { icon: ClipboardList, title: 'Overview',     desc: 'The full Shipmater workflow from post to confirmed delivery.',        href: '/how-it-works' },
      { icon: Package,       title: 'Post & Match', desc: 'Describe your shipment and get quotes from vetted providers.',       href: '/how-it-works/post' },
      { icon: MapPin,        title: 'Track Live',   desc: 'GPS from pickup through delivery — alerts at every milestone.',      href: '/how-it-works/track' },
      { icon: Lock,          title: 'Pay Securely', desc: 'Escrow holds funds until delivery is confirmed by both parties.',   href: '/how-it-works/pay' },
    ],
    cta: { label: 'See the full walkthrough', href: '/how-it-works' },
  },

  industries: {
    heading: 'Industries',
    items: INDUSTRIES.map((i) => ({
      icon:  i.icon,
      title: i.title,
      desc:  i.accent,
      href:  `/industries/${i.slug}`,
    })),
    cta: { label: 'See all industries', href: '/industries' },
  },

  'shippers': {
    heading: 'Shippers',
    items: [
      { icon: Package,       title: 'Overview',          desc: 'Ship anything, track it live, pay only on delivery.',                         href: '/shippers' },
      { icon: ClipboardList, title: 'Shipping & Lanes',  desc: 'Post shipments, multi-stop routes, and contracted lanes.',                  href: '/shippers/shipping' },
      { icon: MapPin,        title: 'Tracking & Pay',    desc: 'Live GPS, escrow payments, and delivery confirmation.',                     href: '/shippers/tracking' },
      { icon: ShieldCheck,   title: 'Verified Carriers', desc: 'Every carrier vetted — identity, authority, background, human review.',       href: '/shippers/trust' },
    ],
    cta: { label: 'Create free shipper account', href: '/register' },
  },

  'carriers': {
    heading: 'Carriers',
    items: [
      { icon: Briefcase,   title: 'Overview',       desc: 'Drive more loads, get paid faster — no factoring.',                          href: '/carriers' },
      { icon: DollarSign,  title: 'Earnings',       desc: 'Job board, bids, escrow payouts, and ratings.',                              href: '/carriers/earnings' },
      { icon: ShieldCheck, title: 'Trust & Safety', desc: '5-layer carrier verification before any load is assigned.',                  href: '/carrier-trust' },
      { icon: Globe,       title: 'International',  desc: 'Register from 100+ countries — credentials adapt to your market.',           href: '/international-carriers' },
    ],
    cta: { label: 'Join free — no subscription', href: '/register?role=carrier' },
  },

  'international': {
    heading: 'International',
    items: [
      { icon: Globe2,      title: 'Global Overview',        desc: 'Freight without borders — USMCA day one, 50+ countries beyond.',              href: '/global' },
      { icon: Flag,        title: 'USMCA',                  desc: 'US, Canada & Mexico — separate compliance, docs, and payouts per country.',   href: '/usmca' },
      { icon: Table2,      title: 'Country Coverage',       desc: 'GPS, identity, background checks, and payouts — what works where.',         href: '/coverage' },
      { icon: UserCircle2, title: 'International Carriers', desc: 'Register from anywhere. Credentials and payouts adapt to your country.',      href: '/international-carriers' },
    ],
    cta: { label: 'Register as an international carrier', href: '/register?role=carrier' },
  },
};

function BigMenuCard({ item }: { item: MenuItem }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        padding: '22px 20px', borderRadius: 12, height: '100%',
        border: `1px solid ${C.border}`, background: C.white,
        transition: 'border-color 0.15s, box-shadow 0.15s', cursor: 'pointer',
      }}
      className="hover:border-[#0096C7] hover:shadow-md group">
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: C.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
        className="group-hover:bg-[#C8E9F5]">
          <Icon size={22} color={C.primary} strokeWidth={1.8} />
        </div>
        <div>
          <p style={{ fontFamily: BODY, fontWeight: 700, fontSize: 16, color: C.text, lineHeight: 1.3, marginBottom: 6 }}>{item.title}</p>
          <p style={{ fontFamily: BODY, fontWeight: 400, fontSize: 14, color: C.muted, lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
        </div>
      </div>
    </Link>
  );
}

export function MegaMenuPanel({ menuKey }: { menuKey: string }) {
  const menu = MENUS[menuKey];
  if (!menu) return null;

  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0,
      background: C.white, borderTop: `3px solid ${C.primary}`,
      boxShadow: '0 16px 48px rgba(10,46,64,0.14)',
      borderRadius: '0 0 10px 10px', zIndex: 100,
    }}>
      <div className="mx-auto max-w-[1200px] px-6" style={{ paddingTop: 28, paddingBottom: 0 }}>
        <p style={{ fontFamily: BODY, fontWeight: 600, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.muted, marginBottom: 16 }}>
          {menu.heading}
        </p>
        <div className="grid grid-cols-4 gap-4" style={{ marginBottom: 8 }}>
          {menu.items.map(item => (
            <BigMenuCard key={item.href} item={item} />
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 20, background: C.surface, borderTop: `1px solid ${C.border}`,
        borderRadius: '0 0 10px 10px', padding: '14px 24px',
      }}>
        <div className="mx-auto max-w-[1200px] px-6">
          <Link href={menu.cta.href} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: BODY, fontWeight: 600, fontSize: 13, color: C.navy, textDecoration: 'none',
          }}
          className="hover:text-[#0096C7] transition-colors group">
            {menu.cta.label}
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
