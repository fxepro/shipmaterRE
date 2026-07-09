'use client';

import Link from 'next/link';
import {
  ClipboardList, UserCheck, CheckCircle2, MapPin, Lock,
  Zap, ShieldCheck, BadgeCheck, Bell, BarChart2,
  Truck, Stethoscope, Car, Gem, UtensilsCrossed, HardHat,
  Package, Search, Route, FileText, Users,
  CreditCard, Building2, Briefcase, DollarSign, Star,
  Globe, Flag, Table2, UserCircle2,
  ArrowRight, type LucideIcon,
} from 'lucide-react';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:      '#0A2E40',
  primary:   '#0096C7',
  light:     '#039BE5',
  surface:   '#F0F4F7',
  iconBg:    '#E0F4FA',
  white:     '#FFFFFF',
  text:      '#1A2B3C',
  muted:     '#64748B',
  border:    '#E2ECF0',
};
const ROBOTO = "'Roboto', 'IBM Plex Sans', system-ui, sans-serif";

// ── Types ─────────────────────────────────────────────────────────────────────
interface MenuItem {
  icon:  LucideIcon;
  title: string;
  desc:  string;
  href?: string;
}
interface MenuColumn {
  heading: string;
  items:   MenuItem[];
  cols?:   number; // grid columns within this column group
}
interface MenuConfig {
  columns:  MenuColumn[];
  cta:      { label: string; href: string };
}

// ── Menu data ─────────────────────────────────────────────────────────────────
export const MENUS: Record<string, MenuConfig> = {

  'how-it-works': {
    columns: [
      {
        heading: 'The Process',
        items: [
          { icon: ClipboardList, title: 'Post a Delivery',     desc: 'Describe what you need moved in under 2 minutes.',               href: '/how-it-works#post' },
          { icon: UserCheck,     title: 'Providers Respond',   desc: 'Vetted, insured providers submit clear upfront quotes.',          href: '/how-it-works#respond' },
          { icon: CheckCircle2,  title: 'Confirm Your Provider', desc: 'Select and lock in — your provider is notified instantly.',     href: '/how-it-works#confirm' },
          { icon: MapPin,        title: 'Track Every Mile',    desc: 'Live GPS map from pickup through to delivery confirmation.',       href: '/how-it-works#track' },
          { icon: Lock,          title: 'Pay on Delivery',     desc: 'Escrow holds funds and releases only on confirmed receipt.',       href: '/how-it-works#pay' },
        ],
      },
      {
        heading: 'Platform',
        items: [
          { icon: Zap,       title: 'Instant Matching',    desc: 'Jobs routed to qualified providers by service type and location.',  href: '/how-it-works' },
          { icon: ShieldCheck, title: 'Escrow Protection', desc: 'Neither party can skip the payment process — funds always secured.', href: '/how-it-works' },
          { icon: BadgeCheck, title: 'Vetting Process',    desc: 'Background checks, insurance, credentials — all independently verified.', href: '/how-it-works' },
          { icon: Bell,      title: 'Live Notifications',  desc: 'Updates at every milestone — en route, arriving, delivered.',       href: '/how-it-works' },
          { icon: BarChart2, title: 'Full Audit Trail',    desc: 'Every ping, status change and payment logged automatically.',        href: '/how-it-works' },
        ],
      },
    ],
    cta: { label: 'See the full walkthrough', href: '/how-it-works' },
  },

  'use-cases': {
    columns: [
      {
        heading: 'Industries',
        cols: 3,
        items: [
          { icon: Truck,           title: 'Freight & Logistics',         desc: 'Full truckload, LTL, hotshot, multi-stop routes.',       href: '/use-cases#freight-logistics' },
          { icon: Stethoscope,     title: 'Medical & Pharmaceutical',    desc: 'HIPAA-aligned, chain-of-custody GPS logging.',           href: '/use-cases#medical' },
          { icon: Car,             title: 'Auto Transport',              desc: 'Open/enclosed, dealer network, private sellers.',        href: '/use-cases#auto-transport' },
          { icon: Gem,             title: 'Art, Antiques & Estates',     desc: 'White glove, climate-controlled, fully insured.',        href: '/use-cases#art-antiques' },
          { icon: UtensilsCrossed, title: 'Food & Beverage',             desc: 'Temp-controlled, scheduled routes, compliance ready.',   href: '/use-cases#food-beverage' },
          { icon: HardHat,         title: 'Construction Equipment',      desc: 'Oversize loads, heavy haul, direct site delivery.',      href: '/use-cases#construction' },
        ],
      },
    ],
    cta: { label: 'See all industry details', href: '/use-cases' },
  },

  'shippers': {
    columns: [
      {
        heading: 'What You Can Do',
        items: [
          { icon: Package,  title: 'Post Any Shipment',         desc: 'One item, a pallet, or a full load — posted in under 2 minutes.',    href: '/shippers' },
          { icon: Search,   title: 'Find Verified Providers',   desc: 'Filter by service type, location, certifications and rating.',        href: '/shippers' },
          { icon: Route,    title: 'Multi-Stop Routing',        desc: 'Optimised routes across multiple drop points, automatically.',         href: '/shippers' },
          { icon: FileText, title: 'Contracted Lanes',          desc: 'Lock in rates with trusted providers — no re-bidding each time.',      href: '/shippers' },
          { icon: Users,    title: 'Team Access',               desc: 'Dispatchers, managers and admins — each with the right access.',       href: '/shippers' },
        ],
      },
      {
        heading: 'Why Shippers Choose Us',
        items: [
          { icon: ShieldCheck, title: '100% Vetted Providers',  desc: 'DOT, MC, insurance and background verified before their first job.',   href: '/shippers' },
          { icon: MapPin,      title: 'Live GPS on Every Job',  desc: '5-second ping interval, automatically shared with your receiver.',     href: '/shippers' },
          { icon: CreditCard,  title: 'Pay Only on Delivery',   desc: 'Escrow-held funds, automatic release on delivery confirmation.',        href: '/shippers' },
          { icon: Building2,   title: 'Any Industry',           desc: 'Healthcare, auto, food, freight, art, construction and more.',          href: '/shippers' },
        ],
      },
    ],
    cta: { label: 'Create free shipper account', href: '/register' },
  },

  'carriers': {
    columns: [
      {
        heading: 'How You Earn',
        items: [
          { icon: Briefcase,   title: 'Matching Job Board',         desc: 'Only see loads that fit your service types and location.',          href: '/carriers' },
          { icon: DollarSign,  title: 'Bid or Get Hired Direct',    desc: 'Open market bids or contracted direct offers from shipper networks.', href: '/carriers' },
          { icon: Truck,       title: '12 Service Types',           desc: 'General freight, medical, auto, white glove, hazmat and more.',      href: '/carriers' },
          { icon: Star,        title: 'Build Your Rating',          desc: 'Every delivery builds your profile — more visibility, more offers.', href: '/carriers' },
          { icon: Users,       title: 'Fleet Accounts',             desc: 'Multi-driver company accounts with centralised job management.',     href: '/carriers' },
        ],
      },
      {
        heading: 'Platform Benefits',
        items: [
          { icon: Zap,        title: 'Fast Escrow Payout',          desc: 'Funds release the moment delivery is confirmed — no chasing invoices.', href: '/carriers' },
          { icon: FileText,   title: 'Digital Compliance Profile',  desc: 'DOT, MC, CDL and insurance stored and visible to every shipper.',      href: '/carriers' },
          { icon: MapPin,     title: 'GPS Built In',                desc: 'No separate app — ping your location directly from the platform.',      href: '/carriers' },
          { icon: ShieldCheck, title: 'Carrier Trust & Safety',     desc: '5-layer vetting: identity, DOT/MC, background, clearinghouse, human review.', href: '/carrier-trust' },
          { icon: Globe,      title: 'Join From 100+ Countries',    desc: 'International carriers welcome — credentials adapt to your country.',  href: '/international-carriers' },
        ],
      },
    ],
    cta: { label: 'Join free — no subscription', href: '/register' },
  },

  'international': {
    columns: [
      {
        heading: 'Global Coverage',
        items: [
          { icon: Globe,        title: 'Freight Without Borders',   desc: 'USMCA coverage day one — US, Canada, and Mexico on one platform.',    href: '/global' },
          { icon: Flag,         title: 'USMCA Deep Dive',           desc: 'Separate compliance for US (FMCSA), Canada (NSC), and Mexico (SCT).', href: '/usmca' },
          { icon: Table2,       title: 'Country Coverage Table',    desc: 'GPS, identity, background checks, and payouts — see what works where.', href: '/coverage' },
          { icon: UserCircle2,  title: 'International Carriers',    desc: 'Register from anywhere. Credentials, payouts, and GPS in 100+ countries.', href: '/international-carriers' },
        ],
      },
      {
        heading: 'Why It Works Globally',
        items: [
          { icon: ShieldCheck,  title: 'Stripe Identity — 100+ Countries', desc: 'Government ID + selfie verification everywhere Stripe operates.',      href: '/coverage' },
          { icon: BarChart2,    title: 'Background Checks — 223 Countries', desc: 'Checkr covers USMCA in full and provides adverse media globally.',    href: '/coverage' },
          { icon: CreditCard,   title: 'Payouts in Local Currency',          desc: 'Stripe Connect supports 46+ countries with local bank deposits.',      href: '/coverage' },
          { icon: MapPin,       title: 'GPS Across All USMCA',               desc: 'Phone GPS works in the US, Canada, and Mexico without extra hardware.', href: '/usmca' },
        ],
      },
    ],
    cta: { label: 'View full country coverage', href: '/coverage' },
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function MenuItemCard({ item }: { item: MenuItem }) {
  const Icon = item.icon;
  const inner = (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '10px 12px',
      borderRadius: 8,
      transition: 'background 0.12s',
      cursor: 'pointer',
    }}
    className="hover:bg-[#F0F4F7] group">
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: C.iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.12s',
      }}
      className="group-hover:bg-[#C8E9F5]">
        <Icon size={17} color={C.primary} strokeWidth={1.8} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: ROBOTO, fontWeight: 600, fontSize: 14, color: C.text, lineHeight: 1.3, marginBottom: 2 }}>
          {item.title}
        </p>
        <p style={{ fontFamily: ROBOTO, fontWeight: 400, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          {item.desc}
        </p>
      </div>
    </div>
  );

  return item.href ? <Link href={item.href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function MegaMenuPanel({ menuKey }: { menuKey: string }) {
  const menu = MENUS[menuKey];
  if (!menu) return null;

  const isIndustries = menuKey === 'use-cases';

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: C.white,
      borderTop: `3px solid ${C.primary}`,
      boxShadow: '0 16px 48px rgba(10,46,64,0.14)',
      borderRadius: '0 0 10px 10px',
      zIndex: 100,
    }}>
      <div className="mx-auto max-w-[1200px] px-6" style={{ paddingTop: 28, paddingBottom: 0 }}>

        {isIndustries ? (
          // 3-column industry grid
          <div>
            <p style={{ fontFamily: ROBOTO, fontWeight: 600, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.muted, marginBottom: 16 }}>
              {menu.columns[0].heading}
            </p>
            <div className="grid grid-cols-3 gap-1" style={{ marginBottom: 8 }}>
              {menu.columns[0].items.map(item => (
                <MenuItemCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        ) : (
          // Two-column layout
          <div className="grid grid-cols-2 gap-8">
            {menu.columns.map(col => (
              <div key={col.heading}>
                <p style={{ fontFamily: ROBOTO, fontWeight: 600, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.muted, marginBottom: 16, paddingLeft: 12 }}>
                  {col.heading}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {col.items.map(item => (
                    <MenuItemCard key={item.title} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* CTA strip */}
      <div style={{
        marginTop: 20,
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        borderRadius: '0 0 10px 10px',
        padding: '14px 24px',
      }}>
        <div className="mx-auto max-w-[1200px] px-6">
          <Link href={menu.cta.href} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: ROBOTO,
            fontWeight: 600,
            fontSize: 13,
            color: C.navy,
            textDecoration: 'none',
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
