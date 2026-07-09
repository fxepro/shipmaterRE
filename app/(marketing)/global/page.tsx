import Link from 'next/link';
import {
  Globe, CheckCircle2, ArrowRight, Truck, ShieldCheck,
  MapPin, CreditCard, Zap, Users, BarChart2, Star,
} from 'lucide-react';

const B = {
  navy:    '#0A2E40',
  teal:    '#0096C7',
  tealLt:  '#90E0EF',
  cream:   '#F0F4F7',
  white:   '#FFFFFF',
  text:    '#1A2B3C',
  muted:   '#64748B',
  border:  '#E2ECF0',
};
const FONT = "'Roboto','IBM Plex Sans',system-ui,sans-serif";

const STATS = [
  { value: '3',    label: 'USMCA countries — day 1'   },
  { value: '55+',  label: 'countries for carrier ID'   },
  { value: '100+', label: 'countries — Stripe Identity' },
  { value: '223',  label: 'countries — background checks' },
];

const REGIONS = [
  {
    flag: '🇺🇸🇨🇦🇲🇽',
    name: 'USMCA — North America',
    tier: 'Tier 1 — Full platform',
    features: [
      'GPS tracking (phone + hardware)',
      'Stripe Connect payouts',
      'Stripe Identity (100+ countries)',
      'Full background check (Checkr)',
      'FMCSA / NSC / SCT authority verification',
      'BOL, POD & Invoice documents',
      'Cross-border customs docs support',
    ],
    color: B.teal,
  },
  {
    flag: '🇬🇧🇩🇪🇫🇷🇦🇺',
    name: 'EU / UK / Australia',
    tier: 'Tier 2 — Core platform',
    features: [
      'GPS tracking (phone)',
      'Stripe Connect payouts (Stripe-supported countries)',
      'Stripe Identity',
      'International background check (Checkr)',
      'Carrier licence upload (Community Licence / Category C)',
      'BOL, POD & Invoice documents',
    ],
    color: '#6366F1',
  },
  {
    flag: '🌍',
    name: '50+ Further Countries',
    tier: 'Tier 3 — Partial support',
    features: [
      'GPS tracking (phone)',
      'Stripe Identity where available',
      'Adverse media check (Checkr global)',
      'Manual authority document upload',
      'BOL, POD & Invoice documents',
    ],
    color: '#64748B',
  },
];

const WHY = [
  { icon: ShieldCheck, title: 'Verified in 100+ Countries',  desc: 'Stripe Identity confirms government-issued IDs, selfie match, and liveness checks — no matter where the carrier is based.' },
  { icon: CreditCard,  title: 'Pay Anywhere Stripe Operates', desc: 'Carriers in 46+ Stripe Connect countries receive payouts directly to their local bank. No wire transfers, no currency headaches.' },
  { icon: MapPin,      title: 'GPS Works Across All USMCA',   desc: 'Phone-based GPS pings work seamlessly in the US, Canada, and Mexico. Hardware trackers extend coverage for fleet vehicles.' },
  { icon: BarChart2,   title: 'Background Checks in 223 Countries', desc: 'Checkr operates across 223 countries. For US carriers, full FMCSA + criminal checks. International carriers get automated adverse media and credential verification.' },
];

export default function GlobalPage() {
  return (
    <div style={{ fontFamily: FONT }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${B.navy} 0%, #0D3B53 60%, #0A5071 100%)`,
        padding: '96px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle globe grid overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }}
          className="bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiPjxwYXRoIGQ9Ik0wIDMwaDYwTTMwIDBoMHY2MCIvPjwvZz48L3N2Zz4=')] bg-[size:60px_60px]"
        />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,150,199,0.18)', border: '1px solid rgba(0,150,199,0.35)',
            borderRadius: 20, padding: '6px 14px', marginBottom: 28,
          }}>
            <Globe size={14} color={B.tealLt} />
            <span style={{ fontSize: 12, fontWeight: 600, color: B.tealLt, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Global Platform
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 800, color: B.white, lineHeight: 1.1, marginBottom: 20 }}>
            Freight Without Borders
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            Shipmater operates across the US, Canada, and Mexico from day one — with carrier verification, GPS tracking, payouts, and compliance built for all three countries.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/usmca" style={{
              background: B.teal, color: B.white, fontWeight: 600, fontSize: 15,
              padding: '12px 28px', borderRadius: 7, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              USMCA Deep Dive <ArrowRight size={15} />
            </Link>
            <Link href="/coverage" style={{
              background: 'rgba(255,255,255,0.1)', color: B.white, fontWeight: 600, fontSize: 15,
              padding: '12px 28px', borderRadius: 7, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              View Country Coverage
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section style={{ background: B.teal }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                padding: '28px 20px', textAlign: 'center',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.25)' : 'none',
              }}>
                <p style={{ fontSize: 36, fontWeight: 800, color: B.white, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 6, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Regional tiers ───────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: B.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 34, fontWeight: 700, color: B.text, textAlign: 'center', marginBottom: 12 }}>
            Where Shipmater Works
          </h2>
          <p style={{ fontSize: 16, color: B.muted, textAlign: 'center', marginBottom: 56, maxWidth: 520, margin: '0 auto 56px' }}>
            Three tiers of coverage — each with a clear feature set so you know exactly what's available.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {REGIONS.map((r, i) => (
              <div key={i} style={{
                border: `1px solid ${B.border}`, borderRadius: 14, overflow: 'hidden',
                boxShadow: i === 0 ? `0 4px 24px rgba(0,150,199,0.12)` : 'none',
              }}>
                <div style={{ background: r.color, padding: '20px 24px' }}>
                  <p style={{ fontSize: 28, marginBottom: 6 }}>{r.flag}</p>
                  <p style={{ fontSize: 17, fontWeight: 700, color: B.white }}>{r.name}</p>
                  <span style={{
                    display: 'inline-block', marginTop: 6,
                    background: 'rgba(255,255,255,0.2)', color: B.white,
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
                    letterSpacing: '0.05em',
                  }}>
                    {r.tier}
                  </span>
                </div>
                <div style={{ padding: '20px 24px', background: B.white }}>
                  {r.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                      <CheckCircle2 size={14} color={r.color} style={{ marginTop: 2, flexShrink: 0 }} />
                      <p style={{ fontSize: 13, color: B.text, lineHeight: 1.5 }}>{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it works globally ─────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: B.cream }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 34, fontWeight: 700, color: B.text, textAlign: 'center', marginBottom: 56 }}>
            Built on Global Infrastructure
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 28 }}>
            {WHY.map((w, i) => (
              <div key={i} style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 14, padding: '28px 28px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#E0F4FA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <w.icon size={20} color={B.teal} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: B.text, marginBottom: 8 }}>{w.title}</h3>
                <p style={{ fontSize: 14, color: B.muted, lineHeight: 1.7 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${B.navy} 0%, #0D3B53 100%)`,
        padding: '72px 24px', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: B.white, marginBottom: 16 }}>
          Ready to Ship Across Borders?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 36 }}>
          Join thousands of shippers and carriers already using Shipmater across North America.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/register" style={{
            background: B.teal, color: B.white, fontWeight: 600, fontSize: 15,
            padding: '13px 32px', borderRadius: 7, textDecoration: 'none',
          }}>
            Get started free
          </Link>
          <Link href="/coverage" style={{
            background: 'transparent', color: B.white, fontWeight: 600, fontSize: 15,
            padding: '13px 32px', borderRadius: 7, textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            View full coverage
          </Link>
        </div>
      </section>

    </div>
  );
}
