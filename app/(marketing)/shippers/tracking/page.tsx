'use client';

import Link from 'next/link';
import {
  ArrowRight, MapPin, Navigation, Bell, Link2, Lock,
  CreditCard, FileText, CheckCircle2, Clock,
  AlertTriangle, Camera,
} from 'lucide-react';
import { MarketingHub } from '@/components/marketing/MarketingHub';
import { SHIPPER_HUB } from '@/lib/marketing/hub-links';
import { T } from '@/lib/type-scale';


const B = {
  teal:     '#90E0EF',
  tealMid:  '#48CAE4',
  tealDark: '#0096C7',
  tealDeep: '#0077B6',
  tealNavy: '#023E8A',
  tealBg:   '#E0F7FA',
  tealPale: '#CAF0F8',
  darkSec:  '#0A2E40',
  gray100:  '#161616',
  gray70:   '#525252',
  gray50:   '#8D8D8D',
  gray20:   '#E0E0E0',
  gray10:   '#F4F4F4',
  white:    '#FFFFFF',
  green:    '#1B9C6B',
};
const BODY = 'var(--font-body)';
const DISPLAY = 'var(--font-display)';

const STATS = [
  { value: '5s',     label: 'GPS update interval' },
  { value: '100%',   label: 'Loads tracked live' },
  { value: 'Escrow', label: 'Payment protection' },
  { value: 'Full',   label: 'Audit trail per job' },
];

const TRACKING = [
  {
    icon: Navigation,
    title: 'Live GPS map',
    desc: 'Carrier position on a real-road map from pickup through final delivery. Route polyline, ETA, and every ping stored for compliance and dispute review.',
    bullets: ['OSRM route overlay with live deviation alerts', 'Historical ping log exportable per shipment', 'En route, arrived, and completed stop states'],
    color: B.tealDeep,
  },
  {
    icon: Link2,
    title: 'Shareable tracking link',
    desc: 'Receivers, consignees, and site managers follow the load without a Shipmater account. One link, read-only view, same map your dispatch team sees.',
    bullets: ['No login required for external parties', 'Tokenised URL — revocable per shipment', 'Mobile-friendly receiver experience'],
    color: B.tealDark,
  },
  {
    icon: Bell,
    title: 'Milestone alerts',
    desc: 'Automatic notifications when a carrier is assigned, confirms pickup, crosses key waypoints, and completes delivery. Email and SMS configurable per user.',
    bullets: ['Carrier assigned and pickup confirmed', 'In-transit GPS updates (configurable)', 'Delivered with photo and signature capture'],
    color: B.tealNavy,
  },
];

const PAYMENT_FLOW = [
  { n: '01', title: 'Funds secured on assignment', desc: 'When you assign a carrier, payment is authorised and held in escrow — not released until delivery criteria are met.' },
  { n: '02', title: 'Carrier hauls with proof', desc: 'GPS progression, stop photos, and delivery confirmation build an evidence chain tied to the job record.' },
  { n: '03', title: 'Delivery confirmed', desc: 'Shipper or receiver confirms delivery. POD, BOL, and invoice documents generated and stored on the shipment.' },
  { n: '04', title: 'Escrow releases', desc: 'Funds release to the carrier on confirmed delivery. Disputes pause release and open a structured resolution workflow.' },
];

const PROTECTION = [
  { icon: Lock,        title: 'Escrow-held funds',     desc: 'Payment is not released on assignment. Carriers complete the job knowing funds are committed; shippers know money stays held until proof of delivery.' },
  { icon: AlertTriangle, title: 'Dispute resolution', desc: 'GPS logs, status history, photos, and signatures form an immutable audit trail. Disputes are reviewed against recorded evidence, not verbal claims.' },
  { icon: FileText,    title: 'Document archive',      desc: 'BOL, POD, and settlement invoices stored permanently per shipment. Export for accounting, insurance, and compliance audits.' },
  { icon: CreditCard,  title: 'Flexible payment methods', desc: 'Card and ACH bank transfer supported. Organisation-level payment methods shared across dispatchers with admin controls.' },
];

export default function ShippersTrackingPage() {
  return (
    <div style={{ fontFamily: BODY, WebkitFontSmoothing: 'antialiased', background: B.white }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(145deg, ${B.tealNavy} 0%, ${B.tealDark} 55%, ${B.teal} 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="relative mx-auto max-w-[1200px] px-6 pt-24 pb-24 text-center">
          <p style={{ fontWeight: 600, fontSize: T.label, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.tealPale, marginBottom: 20 }}>
            Tracking & Pay
          </p>
          <h1 style={{ fontWeight: 700, fontSize: T.hero, lineHeight: 1.07, letterSpacing: '-0.025em', color: B.white, maxWidth: 800, margin: '0 auto' }}>
            See every mile.<br />
            <span style={{ color: B.tealPale }}>Pay only on delivery.</span>
          </h1>
          <p style={{ fontSize: T.body, lineHeight: 1.75, color: 'rgba(255,255,255,0.80)', marginTop: 24, maxWidth: 640, margin: '24px auto 0' }}>
            Live GPS on every assigned load, milestone alerts to your team and receivers, and escrow-held payments that release only when delivery is confirmed with proof.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <Link href="/register"
              style={{ background: B.tealDark, fontSize: T.body, fontWeight: 600, color: B.white, padding: '13px 28px', borderRadius: 6, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              className="hover:opacity-90 transition-opacity">
              Start shipping free <ArrowRight size={16} />
            </Link>
            <Link href="/how-it-works/pay"
              style={{ fontSize: T.body, fontWeight: 500, color: 'rgba(255,255,255,0.80)', padding: '13px 24px', borderRadius: 6, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              className="hover:border-white hover:text-white transition-colors">
              How payment works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: B.white, borderBottom: `1px solid ${B.gray10}` }}>
        <div className="mx-auto max-w-[1200px] px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontWeight: 700, fontSize: T.h2, color: B.tealDark }}>{value}</p>
              <p style={{ fontSize: T.label, color: B.gray50, marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <MarketingHub heading="Shippers" pages={SHIPPER_HUB.map(p => ({ ...p, active: p.href === '/shippers/tracking' }))} />

      {/* Intro */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px, 6vw, 72px) 24px', textAlign: 'center' }}>
        <p style={{ fontWeight: 600, fontSize: T.label, letterSpacing: '0.10em', textTransform: 'uppercase', color: B.tealDark, marginBottom: 12 }}>Visibility + settlement</p>
        <h2 style={{ fontWeight: 700, fontSize: T.h2, color: B.gray100, margin: '0 0 16px' }}>Tracking and payment are not separate problems</h2>
        <p style={{ fontSize: T.body, color: B.gray70, lineHeight: 1.75 }}>
          Most platforms bolt on a tracking link and invoice separately. Shipmater ties GPS progression directly to escrow release —
          the same evidence that proves delivery is the evidence that triggers payment.
        </p>
      </section>

      {/* Tracking features */}
      <section style={{ background: B.gray10 }}>
        <div className="mx-auto max-w-[1200px] px-6 pb-24">
          <p style={{ fontWeight: 600, fontSize: T.label, letterSpacing: '0.10em', textTransform: 'uppercase', color: B.tealDark, textAlign: 'center', marginBottom: 12 }}>Live tracking</p>
          <h2 style={{ fontWeight: 700, fontSize: T.h2, color: B.gray100, textAlign: 'center', marginBottom: 48 }}>Everyone sees the same load, in real time</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {TRACKING.map(({ icon: Icon, title, desc, bullets, color }) => (
              <div key={title} style={{ background: B.white, borderRadius: 12, padding: '28px 26px', border: `1px solid ${B.gray20}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '14', border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: T.h3, color: B.gray100, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: T.body, color: B.gray70, lineHeight: 1.65, marginBottom: 16 }}>{desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {bullets.map(b => (
                    <div key={b} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <CheckCircle2 size={14} color={color} style={{ marginTop: 3, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: B.gray70, lineHeight: 1.5 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment flow */}
      <section style={{ background: B.white }}>
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <p style={{ fontWeight: 600, fontSize: T.label, letterSpacing: '0.10em', textTransform: 'uppercase', color: B.tealDark, textAlign: 'center', marginBottom: 12 }}>Escrow payments</p>
          <h2 style={{ fontWeight: 700, fontSize: T.h2, color: B.gray100, textAlign: 'center', marginBottom: 56 }}>From assignment to carrier payout</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PAYMENT_FLOW.map(({ n, title, desc }) => (
              <div key={n} style={{ background: B.gray10, borderRadius: 8, padding: '28px 24px', border: '1px solid rgba(0,150,199,0.12)' }}>
                <p style={{ fontWeight: 700, fontSize: T.h2, color: B.tealBg, lineHeight: 1, marginBottom: 16 }}>{n}</p>
                <h3 style={{ fontWeight: 600, fontSize: T.h4, color: B.gray100, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: T.body, color: B.gray70, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protection grid */}
      <section style={{ background: B.darkSec }}>
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <p style={{ fontWeight: 600, fontSize: T.label, letterSpacing: '0.10em', textTransform: 'uppercase', color: B.teal, textAlign: 'center', marginBottom: 12 }}>Payment protection</p>
          <h2 style={{ fontWeight: 700, fontSize: T.h2, color: B.white, textAlign: 'center', marginBottom: 48 }}>Built for disputes, not just happy paths</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {PROTECTION.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '28px 24px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Icon size={22} color={B.teal} style={{ marginBottom: 14 }} />
                <h3 style={{ fontWeight: 600, fontSize: T.h4, color: B.white, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: T.body, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof callout */}
      <section style={{ background: B.white, borderTop: `1px solid ${B.gray10}` }}>
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <div style={{ background: B.tealBg, border: '1px solid rgba(0,150,199,0.25)', borderRadius: 8, padding: '28px 32px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <Camera size={24} color={B.tealDeep} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: T.h4, color: B.gray100, marginBottom: 8 }}>Proof of delivery tied to payment release</p>
              <p style={{ fontSize: T.body, color: B.gray70, lineHeight: 1.65 }}>
                Carriers capture delivery photos and signatures at the stop. That record is attached to the shipment and referenced if a dispute is opened.
                Your finance team gets a clean document trail — not a phone call three weeks later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)` }}>
        <div className="mx-auto max-w-[1200px] px-6 py-24 text-center">
          <MapPin size={36} color={B.teal} style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontWeight: 700, fontSize: T.h2, color: B.white, marginBottom: 16 }}>Track and pay on one platform</h2>
          <p style={{ fontSize: T.body, color: 'rgba(255,255,255,0.70)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Live GPS and escrow protection included on every shipment — no add-on modules.
          </p>
          <Link href="/register"
            style={{ background: B.tealDark, fontSize: T.body, fontWeight: 600, color: B.white, padding: '14px 32px', borderRadius: 6, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            className="hover:opacity-90 transition-opacity">
            Start shipping free <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
