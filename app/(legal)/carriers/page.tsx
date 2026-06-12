'use client';

import Link from 'next/link';
import {
  ArrowRight, Briefcase, DollarSign, MapPin, ShieldCheck, Star,
  Zap, FileText, Users, BarChart2, Truck, Clock, BadgeCheck, Lock,
} from 'lucide-react';

// ── Palette & scale (matches marketing system) ────────────────────────────────
const B = {
  teal:     '#90E0EF',
  tealMid:  '#48CAE4',
  tealDark: '#0096C7',
  tealDeep: '#0077B6',
  tealNavy: '#023E8A',
  tealBg:   '#E0F7FA',
  tealPale: '#CAF0F8',
  darkSec:  '#0A2E40',
  darkCard: '#0A1520',
  gray100:  '#161616',
  gray90:   '#262626',
  gray70:   '#525252',
  gray50:   '#8D8D8D',
  gray10:   '#F4F4F4',
  white:    '#FFFFFF',
};

const T = {
  hero:  'clamp(36px, 5.5vw, 56px)' as string | number,
  h1:    40,
  h2:    'clamp(26px, 3.5vw, 32px)' as string | number,
  h3:    22,
  h4:    17,
  body:  16,
  label: 13,
  fine:  12,
};

const IBM = "'IBM Plex Sans', system-ui, sans-serif";

// ── Data ──────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Build your profile',
    desc: 'Set your service types, upload credentials, add your vehicles and verify your DOT and insurance. Your profile is your reputation on the platform.',
  },
  {
    n: '02',
    title: 'Browse matching jobs',
    desc: 'The job board shows loads that match your service types first. Filter by location, distance, or browse the open market for everything available.',
  },
  {
    n: '03',
    title: 'Bid or get direct offers',
    desc: 'Place a bid with your price and timeline on open market jobs. Or receive direct offers from shippers with contracted provider networks.',
  },
  {
    n: '04',
    title: 'Deliver and get paid',
    desc: 'Complete the delivery with photo confirmation and funds release from escrow automatically. No chasing invoices, no payment delays.',
  },
];

const FEATURES = [
  {
    icon: Briefcase,
    title: 'Jobs that match you',
    desc: 'Set your service types once. The job board filters automatically — medical couriers see medical jobs, freight carriers see freight. No irrelevant listings.',
  },
  {
    icon: DollarSign,
    title: 'Fast escrow payouts',
    desc: 'Shipper funds are held in escrow from the moment you\'re assigned. Released on delivery — no payment delays, no invoice follow-ups.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified platform',
    desc: 'Every shipper on the platform is verified. No fraudulent jobs, no payment risk. Escrow protects both sides of every transaction.',
  },
  {
    icon: FileText,
    title: 'Digital compliance profile',
    desc: 'Store your DOT, MC, CDL, certifications and insurance in your profile. Shippers see exactly what you\'re qualified for before they contact you.',
  },
  {
    icon: Star,
    title: 'Build your reputation',
    desc: 'Every delivery builds your rating. Highly-rated providers get more visibility in shipper searches and more direct offers from contracted networks.',
  },
  {
    icon: Users,
    title: 'Company accounts',
    desc: 'Running a fleet? Create a carrier organisation, add your drivers, and manage jobs centrally. Company-level DOT, driver-level certifications.',
  },
  {
    icon: MapPin,
    title: 'GPS tracking built in',
    desc: 'No separate tracking app. Ping your location directly from the platform. Shippers and receivers see your position live — builds trust and reduces calls.',
  },
  {
    icon: BarChart2,
    title: 'Earnings dashboard',
    desc: 'Track completed jobs, pending escrow and total earnings in one view. Export your history for accounting.',
  },
];

const SERVICE_TYPES = [
  'General Freight',
  'Hotshot',
  'Medical Courier',
  'Pharmaceutical',
  'Auto Transport',
  'Heavy Equipment',
  'Refrigerated',
  'Hazardous Materials',
  'White Glove',
  'Last Mile',
  'Household',
  'Art & Specialty',
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CarriersPage() {
  return (
    <div style={{ fontFamily: IBM, WebkitFontSmoothing: 'antialiased', background: B.white }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(145deg, ${B.darkCard} 0%, ${B.darkSec} 55%, ${B.tealNavy} 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="relative mx-auto max-w-[1200px] px-6 pt-24 pb-24 text-center">
          <p style={{ fontFamily: IBM, fontWeight: 600, fontSize: T.label, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.tealPale, marginBottom: 20 }}>
            For Carriers
          </p>
          <h1 style={{ fontFamily: IBM, fontWeight: 700, fontSize: T.hero, lineHeight: 1.07, letterSpacing: '-0.025em', color: B.white, maxWidth: 820, margin: '0 auto' }}>
            Jobs that match<br />
            <span style={{ color: B.teal }}>what you haul.</span>
          </h1>
          <p style={{ fontFamily: IBM, fontWeight: 400, fontSize: T.body, lineHeight: 1.75, color: 'rgba(255,255,255,0.80)', marginTop: 24, maxWidth: 580, margin: '24px auto 0' }}>
            Set your service types once. Get matched with loads that fit your equipment, certifications and location. Bid, get hired, deliver, get paid — all in one platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <Link href="/register"
              style={{ background: B.tealDark, fontFamily: IBM, fontSize: T.body, fontWeight: 600, color: B.white, padding: '13px 28px', borderRadius: 6, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              className="hover:opacity-90 transition-opacity">
              Join as a carrier <ArrowRight size={16} />
            </Link>
            <Link href="/provider-compliance"
              style={{ fontFamily: IBM, fontSize: T.body, fontWeight: 500, color: 'rgba(255,255,255,0.80)', padding: '13px 24px', borderRadius: 6, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              className="hover:border-white hover:text-white transition-colors">
              View requirements
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section style={{ background: B.white, borderBottom: `1px solid ${B.gray10}` }}>
        <div className="mx-auto max-w-[1200px] px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '37+', label: 'Service types' },
            { value: '$0',  label: 'Join fee' },
            { value: '5s',  label: 'GPS ping interval' },
            { value: '100%', label: 'Escrow-protected pay' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontFamily: IBM, fontWeight: 700, fontSize: T.h2, color: B.tealDark }}>{value}</p>
              <p style={{ fontFamily: IBM, fontSize: T.label, color: B.gray50, marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ background: B.gray10 }}>
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <p style={{ fontFamily: IBM, fontWeight: 600, fontSize: T.label, letterSpacing: '0.10em', textTransform: 'uppercase', color: B.tealDark, textAlign: 'center', marginBottom: 12 }}>
            Process
          </p>
          <h2 style={{ fontFamily: IBM, fontWeight: 700, fontSize: T.h2, color: B.gray100, textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 56 }}>
            From signup to first paycheck
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} style={{ background: B.white, borderRadius: 8, padding: '28px 24px', border: `1px solid rgba(0,150,199,0.12)` }}>
                <p style={{ fontFamily: IBM, fontWeight: 700, fontSize: T.h2, color: B.tealBg, lineHeight: 1, marginBottom: 16 }}>{n}</p>
                <h3 style={{ fontFamily: IBM, fontWeight: 600, fontSize: T.h4, color: B.gray100, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontFamily: IBM, fontSize: T.body, color: B.gray70, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE TYPES ────────────────────────────────────────────────── */}
      <section style={{ background: B.white, borderTop: `1px solid ${B.gray10}` }}>
        <div className="mx-auto max-w-[1200px] px-6 py-20 text-center">
          <Truck size={28} color={B.tealDark} style={{ margin: '0 auto 16px' }} />
          <p style={{ fontFamily: IBM, fontWeight: 600, fontSize: T.label, letterSpacing: '0.10em', textTransform: 'uppercase', color: B.tealDark, marginBottom: 12 }}>
            Service Types
          </p>
          <h2 style={{ fontFamily: IBM, fontWeight: 700, fontSize: T.h2, color: B.gray100, letterSpacing: '-0.02em', marginBottom: 12 }}>
            What can you list?
          </h2>
          <p style={{ fontFamily: IBM, fontSize: T.body, color: B.gray70, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
            Select all that apply to your operation. Jobs only show when they match your selections.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICE_TYPES.map(name => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, background: B.tealBg, border: `1px solid rgba(0,150,199,0.20)`, borderRadius: 8, padding: '10px 18px' }}>
                <span style={{ fontFamily: IBM, fontWeight: 500, fontSize: T.body, color: B.tealDeep }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section style={{ background: B.gray10 }}>
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <p style={{ fontFamily: IBM, fontWeight: 600, fontSize: T.label, letterSpacing: '0.10em', textTransform: 'uppercase', color: B.tealDark, textAlign: 'center', marginBottom: 12 }}>
            Features
          </p>
          <h2 style={{ fontFamily: IBM, fontWeight: 700, fontSize: T.h2, color: B.gray100, textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 56 }}>
            Built for how carriers actually work
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: B.white, borderRadius: 8, padding: '24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: B.tealBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={18} color={B.tealDark} />
                </div>
                <h3 style={{ fontFamily: IBM, fontWeight: 600, fontSize: T.h4, color: B.gray100, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontFamily: IBM, fontSize: T.body, color: B.gray70, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REQUIREMENTS CALLOUT ─────────────────────────────────────────── */}
      <section style={{ background: B.white, borderTop: `1px solid ${B.gray10}` }}>
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <div style={{ background: B.tealBg, border: `1px solid rgba(0,150,199,0.20)`, borderRadius: 8, padding: '28px 32px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <ShieldCheck size={24} color={B.tealDark} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontFamily: IBM, fontWeight: 600, fontSize: T.h4, color: B.gray100, marginBottom: 10 }}>What you need to join</p>
              <p style={{ fontFamily: IBM, fontSize: T.body, color: B.gray70, lineHeight: 1.65, marginBottom: 16 }}>
                Requirements depend on the services you offer. At minimum, all carriers need valid commercial auto liability insurance and a clean background check. DOT and MC authority are required for interstate freight and hazmat.
              </p>
              <Link href="/provider-compliance"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: IBM, fontSize: T.body, fontWeight: 600, color: B.tealDark, textDecoration: 'none' }}>
                See full requirements by service type <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(135deg, ${B.darkCard} 0%, ${B.tealNavy} 100%)` }}>
        <div className="mx-auto max-w-[1200px] px-6 py-24 text-center">
          <Zap size={36} color={B.teal} style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontFamily: IBM, fontWeight: 700, fontSize: T.h2, color: B.white, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Start finding jobs today
          </h2>
          <p style={{ fontFamily: IBM, fontSize: T.body, color: 'rgba(255,255,255,0.70)', maxWidth: 400, margin: '0 auto 36px' }}>
            Free to join. No subscription. Take the jobs you want, skip the rest.
          </p>
          <Link href="/register"
            style={{ background: B.tealDark, fontFamily: IBM, fontSize: T.body, fontWeight: 600, color: B.white, padding: '14px 32px', borderRadius: 6, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            className="hover:opacity-90 transition-opacity">
            Create carrier account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
