'use client';

import Link from 'next/link';
import {
  CheckCircle2, ArrowRight, ShieldCheck, FileText,
  MapPin, Globe,
} from 'lucide-react';

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

const COUNTRIES = [
  {
    flag: '🇺🇸', name: 'United States', color: B.tealDeep,
    fields: [
      ['Operating Authority', 'FMCSA (DOT# + MC#)'],
      ['Driving Licence',     'CDL Class A/B/C'],
      ['Background Check',    'FMCSA SAFER + criminal screening'],
      ['Clearinghouse',       'FMCSA Drug & Alcohol Clearinghouse'],
      ['Payouts',            'Direct bank deposit (USD)'],
      ['GPS Tracking',        'Phone GPS + hardware'],
    ],
  },
  {
    flag: '🇨🇦', name: 'Canada', color: '#c8102e',
    fields: [
      ['Operating Authority', 'NSC (National Safety Code)'],
      ['Driving Licence',     'Class 1/2/3 provincial'],
      ['Background Check',    'Provincial criminal + national records'],
      ['Clearinghouse',       'Not applicable (no federal equivalent)'],
      ['Payouts',            'Direct bank deposit (CAD)'],
      ['GPS Tracking',        'Phone GPS + hardware'],
    ],
  },
  {
    flag: '🇲🇽', name: 'Mexico', color: '#006847',
    fields: [
      ['Operating Authority', 'Permiso SCT + SICT Licencia Federal'],
      ['Driving Licence',     'Licencia Federal (Tipo C/E)'],
      ['Background Check',    'Adverse media + document verification'],
      ['Clearinghouse',       'Not applicable'],
      ['Payouts',            'Direct bank deposit (MXN)'],
      ['GPS Tracking',        'Phone GPS'],
    ],
  },
];

const CROSSBORDER = [
  { step: '01', icon: Globe, title: 'Carrier registers with operating country', desc: 'When a carrier selects their operating country, the platform shows the correct licence class options (CDL / Class 1 / Licencia Federal), authority number fields (DOT+MC / NSC / Permiso SCT), and country-appropriate ID verification.', color: B.tealDeep },
  { step: '02', icon: ShieldCheck, title: 'Identity verified', desc: 'All three countries are covered by government ID verification — passport, driver\'s licence, national ID card — with selfie match and liveness detection across 100+ countries.', color: B.tealMid },
  { step: '03', icon: FileText, title: 'Background check routes by country', desc: 'Checks are automatically routed using the carrier\'s operating country. US carriers get full FMCSA SAFER + criminal. Canadian carriers get provincial criminal records. Mexican carriers get adverse media and document verification.', color: B.green },
  { step: '04', icon: MapPin, title: 'GPS tracking works across all three', desc: 'Phone GPS via the carrier\'s mobile browser works in the US, Canada, and Mexico without configuration. For fleet operators, hardware trackers with cellular LTE connectivity cover all USMCA countries seamlessly.', color: B.tealDark },
  { step: '05', icon: CheckCircle2, title: 'Payouts in local currency', desc: 'USD, CAD, and MXN payouts to local bank accounts. Shippers can pay in their preferred currency; the platform handles FX where applicable.', color: B.tealNavy },
  { step: '06', icon: FileText, title: 'Documents use correct terminology', desc: 'BOL and POD documents auto-populate carrier authority fields with the appropriate format — MC# for US, NSC# for Canada, Permiso SCT for Mexico. Carrier credentials shown match the operating country.', color: B.tealDeep },
];

const DOCS = [
  { label: 'Rate Confirmation',      applies: ['US', 'CA', 'MX'] },
  { label: 'Carrier Agreement',      applies: ['US', 'CA', 'MX'] },
  { label: 'Bill of Lading (BOL)',   applies: ['US', 'CA', 'MX'] },
  { label: 'Proof of Delivery',      applies: ['US', 'CA', 'MX'] },
  { label: 'Invoice / Settlement',   applies: ['US', 'CA', 'MX'] },
  { label: 'FMCSA authority on doc', applies: ['US'] },
  { label: 'NSC number on doc',      applies: ['CA'] },
  { label: 'Permiso SCT on doc',     applies: ['MX'] },
];

export default function UsmcaPage() {
  return (
    <div style={{ fontFamily: IBM, background: B.white, color: B.darkCard }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)`, padding: 'clamp(64px, 8vw, 112px) 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(144,224,239,0.12)', border: '1px solid rgba(144,224,239,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: 16 }}>🇺🇸🇨🇦🇲🇽</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: B.teal, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              USMCA — North America
            </span>
          </div>
          <h1 style={{ fontSize: T.hero, fontWeight: 700, color: B.white, lineHeight: 1.15, margin: '0 0 20px' }}>
            One Platform. Three Countries.<br />
            <span style={{ color: B.tealMid }}>Full Compliance.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 36px' }}>
            Shipmater is built for the USMCA trade corridor from day one — separate regulatory compliance, GPS tracking, background checks, and payouts for US, Canadian, and Mexican carriers and shippers.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: B.tealMid, color: B.tealNavy, fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}>
              Get started <ArrowRight size={16} />
            </Link>
            <Link href="/coverage"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: B.white, fontWeight: 600, fontSize: 15, padding: '12px 28px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>
              View all country coverage
            </Link>
          </div>
        </div>
      </section>

      {/* Country cards */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, margin: '0 0 12px' }}>
            Country-Specific Compliance
          </h2>
          <p style={{ fontSize: T.body, color: B.gray70, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Each country has its own authority, licence, and verification requirements — all handled automatically.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {COUNTRIES.map((c, i) => (
            <div key={i} style={{ border: `1px solid ${B.gray20}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ background: c.color, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>{c.flag}</span>
                <h3 style={{ fontSize: T.h3, fontWeight: 700, color: B.white, margin: 0 }}>{c.name}</h3>
              </div>
              <div style={{ padding: '20px 24px', background: B.white }}>
                {c.fields.map(([k, v]) => (
                  <div key={k} style={{ borderBottom: `1px solid ${B.gray20}`, paddingBottom: 12, marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: B.gray70, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{k}</p>
                    <p style={{ fontSize: 14, color: B.darkCard, lineHeight: 1.5, margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How cross-border works */}
      <section style={{ background: B.gray10, padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, margin: '0 0 12px' }}>
              How Cross-Border Onboarding Works
            </h2>
            <p style={{ fontSize: T.body, color: B.gray70, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Everything adapts automatically based on where the carrier operates.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {CROSSBORDER.map((s) => {
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

      {/* Documents table */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, margin: '0 0 12px' }}>
            Documents for Every Country
          </h2>
          <p style={{ fontSize: T.body, color: B.gray70, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            All PDF documents are tenant-branded and auto-populate the correct authority numbers based on the carrier's operating country.
          </p>
        </div>
        <div style={{ border: `1px solid ${B.gray20}`, borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: B.gray10 }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: B.gray70, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Document</th>
                {['🇺🇸 US', '🇨🇦 CA', '🇲🇽 MX'].map(c => (
                  <th key={c} style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: B.darkCard }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOCS.map((d, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${B.gray20}`, background: i % 2 === 0 ? B.white : B.gray10 }}>
                  <td style={{ padding: '14px 20px', fontSize: 15, color: B.darkCard, fontWeight: 500 }}>{d.label}</td>
                  {['US', 'CA', 'MX'].map(c => (
                    <td key={c} style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {d.applies.includes(c)
                        ? <CheckCircle2 size={16} color={B.tealDeep} style={{ display: 'inline' }} />
                        : <span style={{ color: B.gray20, fontSize: 18 }}>–</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)`, padding: 'clamp(48px, 6vw, 80px) 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.white, margin: '0 0 16px' }}>
          Operating in the USMCA corridor?
        </h2>
        <p style={{ fontSize: T.body, color: 'rgba(255,255,255,0.72)', margin: '0 auto 32px', maxWidth: 440, lineHeight: 1.7 }}>
          Register once. Your profile adapts to the country you operate in.
        </p>
        <Link href="/register"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: B.tealMid, color: B.tealNavy, fontWeight: 700, fontSize: 15, padding: '13px 30px', borderRadius: 10, textDecoration: 'none' }}>
          Create your profile <ArrowRight size={16} />
        </Link>
      </section>

    </div>
  );
}
