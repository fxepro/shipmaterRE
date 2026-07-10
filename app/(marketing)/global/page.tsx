'use client';

import Link from 'next/link';
import {
  Globe, CheckCircle2, ArrowRight, ShieldCheck,
  MapPin, CreditCard, BarChart2,
} from 'lucide-react';
import { MarketingHub } from '@/components/marketing/MarketingHub';
import { INTERNATIONAL_HUB } from '@/lib/marketing/hub-links';

const B = {
  teal:     '#90E0EF',
  tealMid:  '#48CAE4',
  tealDark: '#0096C7',
  tealDeep: '#0077B6',
  tealNavy: '#023E8A',
  darkSec:  '#0A2E40',
  darkCard: '#0A1520',
  gray70:   '#525252',
  gray20:   '#E0E0E0',
  gray10:   '#F4F4F4',
  white:    '#FFFFFF',
  green:    '#1B9C6B',
};
const IBM = "'IBM Plex Sans', system-ui, sans-serif";
const T = {
  hero: 'clamp(34px, 5vw, 52px)' as string | number,
  h2:   'clamp(26px, 3.5vw, 34px)' as string | number,
  h3:   20,
  body: 16,
};

const STATS = [
  { value: '3',    label: 'USMCA countries — day 1' },
  { value: '55+',  label: 'countries for carrier ID' },
  { value: '100+', label: 'countries for identity verification' },
  { value: '223',  label: 'countries with background screening' },
];

const REGIONS = [
  {
    flag: '🇺🇸🇨🇦🇲🇽',
    name: 'USMCA — North America',
    tier: 'Tier 1 — Full platform',
    features: [
      'GPS tracking (phone + hardware)',
      'Direct bank payouts in local currency',
      'Government ID + selfie verification',
      'Full background screening',
      'FMCSA / NSC / SCT authority verification',
      'BOL, POD & Invoice documents',
      'Cross-border customs docs support',
    ],
    color: B.tealDeep,
  },
  {
    flag: '🇬🇧🇩🇪🇫🇷🇦🇺',
    name: 'EU / UK / Australia',
    tier: 'Tier 2 — Core platform',
    features: [
      'GPS tracking (phone)',
      'Direct bank payouts where supported',
      'Identity verification',
      'International background screening',
      'Carrier licence upload (Community Licence / Category C)',
      'BOL, POD & Invoice documents',
    ],
    color: B.tealNavy,
  },
  {
    flag: '🌍',
    name: '50+ Further Countries',
    tier: 'Tier 3 — Partial support',
    features: [
      'GPS tracking (phone)',
      'Identity verification where available',
      'Adverse media & sanctions screening',
      'Manual authority document upload',
      'BOL, POD & Invoice documents',
    ],
    color: B.gray70,
  },
];

const WHY = [
  { icon: ShieldCheck, title: 'Verified in 100+ Countries', desc: 'Government-issued ID confirmation, selfie match, and liveness checks — no matter where the carrier is based.' },
  { icon: CreditCard,  title: 'Payouts in Local Currency', desc: 'Carriers in 46+ countries receive earnings directly to their local bank. No wire transfers, no currency headaches.' },
  { icon: MapPin,      title: 'GPS Works Across All USMCA',  desc: 'Phone-based GPS pings work seamlessly in the US, Canada, and Mexico. Hardware trackers extend coverage for fleet vehicles.' },
  { icon: BarChart2,   title: 'Background Screening Worldwide', desc: 'Full FMCSA + criminal checks for US carriers. International carriers get automated adverse media and credential verification.' },
];

export default function GlobalPage() {
  return (
    <div style={{ fontFamily: IBM, background: B.white, color: B.darkCard }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)`, padding: 'clamp(64px, 8vw, 112px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(144,224,239,0.12)', border: '1px solid rgba(144,224,239,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 24 }}>
            <Globe size={14} color={B.teal} />
            <span style={{ fontSize: 12, fontWeight: 600, color: B.teal, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Global Platform
            </span>
          </div>
          <h1 style={{ fontSize: T.hero, fontWeight: 700, color: B.white, lineHeight: 1.15, margin: '0 0 20px' }}>
            Freight Without Borders
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            Shipmater operates across the US, Canada, and Mexico from day one — with carrier verification, GPS tracking, payouts, and compliance built for all three countries.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: B.tealNavy, borderBottom: `1px solid rgba(144,224,239,0.15)` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
          {STATS.map(s => (
            <div key={s.value} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: B.tealMid, margin: '0 0 4px' }}>{s.value}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <MarketingHub heading="International" pages={INTERNATIONAL_HUB.map(p => ({ ...p, active: p.href === '/global' }))} />

      {/* Regional tiers */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, margin: '0 0 12px' }}>
            Where Shipmater Works
          </h2>
          <p style={{ fontSize: T.body, color: B.gray70, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Three tiers of coverage — each with a clear feature set so you know exactly what's available.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {REGIONS.map((r, i) => (
            <div key={i} style={{
              border: `1px solid ${B.gray20}`, borderRadius: 16, overflow: 'hidden',
              boxShadow: i === 0 ? '0 4px 24px rgba(0,150,199,0.10)' : 'none',
            }}>
              <div style={{ background: r.color, padding: '24px 28px' }}>
                <p style={{ fontSize: 28, margin: '0 0 8px' }}>{r.flag}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: B.white, margin: 0 }}>{r.name}</p>
                <span style={{
                  display: 'inline-block', marginTop: 8,
                  background: 'rgba(255,255,255,0.2)', color: B.white,
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                }}>
                  {r.tier}
                </span>
              </div>
              <div style={{ padding: '20px 24px', background: B.white }}>
                {r.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <CheckCircle2 size={14} color={r.color} style={{ marginTop: 3, flexShrink: 0 }} />
                    <p style={{ fontSize: 14, color: B.gray70, lineHeight: 1.6, margin: 0 }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why it works globally */}
      <section style={{ background: B.gray10, padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, textAlign: 'center', margin: '0 0 48px' }}>
            Built on Global Infrastructure
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {WHY.map((w, i) => (
              <div key={i} style={{ background: B.white, border: `1px solid ${B.gray20}`, borderRadius: 16, padding: '28px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: B.tealDeep + '18', border: `1.5px solid ${B.tealDeep}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <w.icon size={20} color={B.tealDeep} />
                </div>
                <h3 style={{ fontSize: T.h3, fontWeight: 700, color: B.darkCard, margin: '0 0 8px' }}>{w.title}</h3>
                <p style={{ fontSize: 15, color: B.gray70, lineHeight: 1.75, margin: 0 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)`, padding: 'clamp(48px, 6vw, 80px) 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.white, margin: '0 0 16px' }}>
          Ready to Ship Across Borders?
        </h2>
        <p style={{ fontSize: T.body, color: 'rgba(255,255,255,0.72)', margin: '0 auto 36px', maxWidth: 480, lineHeight: 1.7 }}>
          Join shippers and carriers already using Shipmater across North America.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/register"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: B.tealMid, color: B.tealNavy, fontWeight: 700, fontSize: 15, padding: '13px 30px', borderRadius: 10, textDecoration: 'none' }}>
            Get started free
          </Link>
          <Link href="/coverage"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: B.white, fontWeight: 600, fontSize: 15, padding: '13px 30px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>
            View full coverage
          </Link>
        </div>
      </section>

    </div>
  );
}
