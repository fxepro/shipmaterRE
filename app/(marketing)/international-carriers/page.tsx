'use client';

import Link from 'next/link';
import {
  ArrowRight, Globe, ShieldCheck, CreditCard,
  MapPin, FileText, Star, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { T } from '@/lib/type-scale';


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
const BODY = 'var(--font-body)';
const DISPLAY = 'var(--font-display)';

const STATS = [
  { value: '100+', label: 'countries for identity verification' },
  { value: '46+',  label: 'countries for local bank payouts' },
  { value: '223',  label: 'countries with background screening' },
  { value: '3',    label: 'USMCA countries — full platform' },
];

const CREDS = [
  {
    flag: '🇺🇸', country: 'United States', color: B.tealDeep,
    fields: [
      ['Authority',        'USDOT + MC Number (FMCSA)'],
      ['Licence',          'CDL Class A, B or C'],
      ['ID accepted',      'Government-issued photo ID'],
      ['Background check', 'Full FMCSA + criminal screening'],
    ],
  },
  {
    flag: '🇨🇦', country: 'Canada', color: '#c8102e',
    fields: [
      ['Authority',        'NSC Number (National Safety Code)'],
      ['Licence',          'Class 1, 2, 3 or 4 (provincial)'],
      ['ID accepted',      'Provincial driver\'s licence'],
      ['Background check', 'Provincial criminal records'],
    ],
  },
  {
    flag: '🇲🇽', country: 'Mexico', color: '#006847',
    fields: [
      ['Authority',        'Permiso SCT (SICT)'],
      ['Licence',          'Licencia Federal Tipo C or E'],
      ['ID accepted',      'INE / Pasaporte'],
      ['Background check', 'Adverse media + document verification'],
    ],
  },
  {
    flag: '🇬🇧🇩🇪🇫🇷', country: 'EU / UK', color: B.tealNavy,
    fields: [
      ['Authority',        'Community Licence (EU) / Operator Licence (UK)'],
      ['Licence',          'Category C or C+E'],
      ['ID accepted',      'Passport or national ID'],
      ['Background check', 'Criminal background screening'],
    ],
  },
  {
    flag: '🌍', country: 'All Other Countries', color: B.gray70,
    fields: [
      ['Authority',        'National transport authority document (upload)'],
      ['Licence',          'National HGV / truck licence'],
      ['ID accepted',      'Passport — verified via identity check'],
      ['Background check', 'Adverse media + sanctions screening'],
    ],
  },
];

const STEPS = [
  { step: '01', icon: Globe, title: 'Register and choose your operating country', desc: 'The platform immediately adapts — showing the right authority number fields, licence categories, and ID formats for your country.', color: B.tealDeep },
  { step: '02', icon: ShieldCheck, title: 'Verify your identity', desc: 'Upload your government-issued ID (passport, driver\'s licence, or national ID card). Selfie match and liveness check covers 100+ countries in minutes.', color: B.tealMid },
  { step: '03', icon: FileText, title: 'Submit your operating credentials', desc: 'Enter your DOT/NSC/Permiso SCT number or upload your operating authority document. For US carriers, FMCSA data is automatically cross-referenced.', color: B.green },
  { step: '04', icon: ShieldCheck, title: 'Pass the background check', desc: 'Checks are automatically routed by country — full criminal + driving record for USMCA, adverse media for all others. US only: FMCSA Drug & Alcohol Clearinghouse.', color: B.tealDark },
  { step: '05', icon: CreditCard, title: 'Connect your bank for payouts', desc: 'Local bank payouts in 46+ countries — USD, CAD, MXN, GBP, EUR, AUD, and more. No wire transfers.', color: B.tealNavy },
  { step: '06', icon: Star, title: 'Start accepting jobs', desc: 'Once approved, your profile is visible to shippers. Jobs matched to your service type and operating region appear on your board.', color: B.tealDeep },
];

const BENEFITS = [
  { icon: Globe,       title: 'Verified in 100+ countries',   desc: 'Government IDs from over 100 countries accepted. Carry your credentials digitally.', color: B.tealDeep },
  { icon: CreditCard,  title: 'Pay out in local currency',     desc: 'Receive earnings directly to your bank — CAD, MXN, GBP, EUR, AUD, and more.', color: B.tealMid },
  { icon: MapPin,      title: 'GPS works everywhere',          desc: 'Phone GPS tracking works across the US, Canada, and Mexico without any extra app or hardware.', color: B.tealDark },
  { icon: FileText,    title: 'Documents in your format',      desc: 'BOL and POD documents use your country\'s authority number format automatically.', color: B.green },
  { icon: ShieldCheck, title: 'One profile, any country',      desc: 'Update your operating country at any time. Your verification status follows you.', color: B.tealNavy },
  { icon: Star,        title: 'Build a global reputation',     desc: 'Ratings are portable. A 5-star record in Canada is visible to US shippers and vice versa.', color: B.tealDeep },
];

const FAQS = [
  { q: 'I\'m based in Canada — can I accept US loads?', a: 'Yes. If you hold a valid USDOT + MC number and US CDL, you can accept US-origin loads. Simply add a secondary operating country in your profile.' },
  { q: 'Do I need a US Social Security Number to register?', a: 'No. A tax identifier is only collected if you operate in the US. For Canada, Mexico, and international carriers, your local bank account and national ID are sufficient.' },
  { q: 'How long does verification take outside the US?', a: 'Identity verification typically completes in 2–5 minutes. Background checks for non-US carriers (adverse media + sanctions) usually complete within an hour. Manual document review adds 1–2 business days.' },
  { q: 'What if my country isn\'t in the coverage table?', a: 'You can still register. Identity verification covers 100+ countries. You can upload your transport licence manually. Payout availability depends on whether direct bank deposits are supported in your country.' },
  { q: 'Are payouts in my local currency?', a: 'Where supported, yes — you receive earnings in your local currency to your local bank account. For countries without direct deposit support, USD wire or alternative settlement can be arranged.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${B.gray20}`, padding: '18px 0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, gap: 16, textAlign: 'left' }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: B.darkCard, lineHeight: 1.4 }}>{q}</span>
        <ChevronDown size={18} color={B.gray70} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <p style={{ fontSize: 15, color: B.gray70, lineHeight: 1.75, margin: '12px 0 0' }}>{a}</p>
      )}
    </div>
  );
}

export default function InternationalCarriersPage() {
  return (
    <div style={{ fontFamily: BODY, background: B.white, color: B.darkCard }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)`, padding: 'clamp(64px, 8vw, 112px) 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(144,224,239,0.12)', border: '1px solid rgba(144,224,239,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 24 }}>
            <Globe size={14} color={B.teal} />
            <span style={{ fontSize: 12, fontWeight: 600, color: B.teal, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              International Carriers
            </span>
          </div>
          <h1 style={{ fontSize: T.hero, fontWeight: 700, color: B.white, lineHeight: 1.15, margin: '0 0 20px' }}>
            Join Shipmater<br />
            <span style={{ color: B.tealMid }}>From Anywhere in the World</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 36px' }}>
            Whether you're based in Toronto, Mexico City, Berlin, or Sydney — the platform adapts to your credentials, currency, and compliance requirements.
          </p>
          <Link href="/register?role=carrier"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: B.tealMid, color: B.tealNavy, fontWeight: 700, fontSize: 15, padding: '13px 30px', borderRadius: 10, textDecoration: 'none' }}>
            Register as a carrier <ArrowRight size={16} />
          </Link>
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

      {/* Credentials */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, margin: '0 0 12px' }}>
            What Credentials You Need
          </h2>
          <p style={{ fontSize: T.body, color: B.gray70, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            The platform shows you exactly what to upload based on your operating country.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {CREDS.map((c, i) => (
            <div key={i} style={{ border: `1px solid ${B.gray20}`, borderRadius: 16, padding: '24px 28px', background: B.gray10 }}>
              <p style={{ fontSize: 28, margin: '0 0 8px' }}>{c.flag}</p>
              <h3 style={{ fontSize: T.h3, fontWeight: 700, color: B.darkCard, margin: '0 0 16px' }}>{c.country}</h3>
              {c.fields.map(([k, v]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: B.gray70, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>{k}</p>
                  <p style={{ fontSize: 14, color: B.darkCard, lineHeight: 1.5, margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* How to register */}
      <section style={{ background: B.gray10, padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, margin: '0 0 12px' }}>
              How to Get Started
            </h2>
            <p style={{ fontSize: T.body, color: B.gray70, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Six steps from sign-up to your first international load.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} style={{
                  background: B.white, border: `1px solid ${B.gray20}`, borderRadius: 16,
                  padding: 'clamp(20px, 3vw, 28px)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: s.color + '18', border: `1.5px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color={s.color} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: '0.12em' }}>{s.step}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: T.h3, fontWeight: 700, color: B.darkCard, margin: '0 0 8px' }}>{s.title}</h3>
                    <p style={{ fontSize: 15, color: B.gray70, lineHeight: 1.75, margin: 0 }}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, margin: '0 0 12px' }}>
            Why International Carriers Choose Shipmater
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{ border: `1px solid ${B.gray20}`, borderRadius: 16, padding: '28px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: b.color + '18', border: `1.5px solid ${b.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <b.icon size={20} color={b.color} />
              </div>
              <h3 style={{ fontSize: T.h3, fontWeight: 700, color: B.darkCard, margin: '0 0 8px' }}>{b.title}</h3>
              <p style={{ fontSize: 15, color: B.gray70, lineHeight: 1.75, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: B.gray10, padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, textAlign: 'center', margin: '0 0 48px' }}>
            Frequently Asked Questions
          </h2>
          <div>
            {FAQS.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)`, padding: 'clamp(48px, 6vw, 80px) 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.white, margin: '0 0 16px' }}>
          Ready to haul across borders?
        </h2>
        <p style={{ fontSize: T.body, color: 'rgba(255,255,255,0.72)', margin: '0 auto 36px', maxWidth: 440, lineHeight: 1.7 }}>
          Join free — no monthly subscription. Earn on every delivery.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/register?role=carrier"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: B.tealMid, color: B.tealNavy, fontWeight: 700, fontSize: 15, padding: '13px 30px', borderRadius: 10, textDecoration: 'none' }}>
            Create carrier account <ArrowRight size={16} />
          </Link>
          <Link href="/coverage"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: B.white, fontWeight: 600, fontSize: 15, padding: '13px 30px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>
            Check your country
          </Link>
        </div>
      </section>

    </div>
  );
}
