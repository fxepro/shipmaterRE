import Link from 'next/link';
import {
  CheckCircle2, ArrowRight, Truck, ShieldCheck, FileText,
  CreditCard, MapPin, Globe, AlertCircle, Building2,
} from 'lucide-react';

const B = { navy:'#0A2E40', teal:'#0096C7', tealLt:'#90E0EF', cream:'#F0F4F7', white:'#FFFFFF', text:'#1A2B3C', muted:'#64748B', border:'#E2ECF0' };
const FONT = "'Roboto','IBM Plex Sans',system-ui,sans-serif";

const COUNTRIES = [
  {
    flag: '🇺🇸',
    name: 'United States',
    authority: 'FMCSA (DOT# + MC#)',
    licence: 'CDL Class A/B/C',
    bgCheck: 'Checkr — FMCSA SAFER + Criminal',
    clearinghouse: 'FMCSA Drug & Alcohol Clearinghouse',
    payout: 'Stripe Connect (USD)',
    gps: 'Phone GPS + hardware',
    color: '#1a56a4',
  },
  {
    flag: '🇨🇦',
    name: 'Canada',
    authority: 'NSC (National Safety Code)',
    licence: 'Class 1/2/3 provincial',
    bgCheck: 'Checkr — Provincial criminal + CPIC lookup',
    clearinghouse: 'Not applicable (no federal equivalent)',
    payout: 'Stripe Connect (CAD)',
    gps: 'Phone GPS + hardware',
    color: '#c8102e',
  },
  {
    flag: '🇲🇽',
    name: 'Mexico',
    authority: 'Permiso SCT + SICT Licencia Federal',
    licence: 'Licencia Federal (Tipo C/E)',
    bgCheck: 'Checkr — Adverse media + manual RENAPO',
    clearinghouse: 'Not applicable',
    payout: 'Stripe Connect (MXN)',
    gps: 'Phone GPS',
    color: '#006847',
  },
];

const CROSSBORDER = [
  {
    step: '01',
    title: 'Carrier registers with operating country',
    desc: 'When a carrier selects their operating country, the platform shows the correct licence class options (CDL / Class 1 / Licencia Federal), authority number fields (DOT+MC / NSC / Permiso SCT), and country-appropriate ID verification.',
  },
  {
    step: '02',
    title: 'Identity verified via Stripe Identity',
    desc: 'All three countries are covered by Stripe Identity\'s 100+ country government ID check — passport, driver\'s licence, national ID card — with selfie match and liveness detection.',
  },
  {
    step: '03',
    title: 'Background check routes by country',
    desc: 'Checkr automatically routes checks using the carrier\'s operating country. US carriers get full FMCSA SAFER + criminal. Canadian carriers get provincial criminal records. Mexican carriers get adverse media and document verification.',
  },
  {
    step: '04',
    title: 'GPS tracking works across all three',
    desc: 'Phone GPS via the carrier\'s mobile browser works in the US, Canada, and Mexico without configuration. For fleet operators, hardware trackers with cellular LTE connectivity cover all USMCA countries seamlessly.',
  },
  {
    step: '05',
    title: 'Payouts in local currency',
    desc: 'Stripe Connect supports USD, CAD, and MXN payouts to local bank accounts. Shippers can pay in their preferred currency; the platform handles FX where applicable.',
  },
  {
    step: '06',
    title: 'Documents use correct terminology',
    desc: 'BOL and POD documents auto-populate carrier authority fields with the appropriate format — MC# for US, NSC# for Canada, Permiso SCT for Mexico. Carrier credentials shown match the operating country.',
  },
];

const DOCS = [
  { label: 'Rate Confirmation',     applies: ['US', 'CA', 'MX'] },
  { label: 'Carrier Agreement',     applies: ['US', 'CA', 'MX'] },
  { label: 'Bill of Lading (BOL)',  applies: ['US', 'CA', 'MX'] },
  { label: 'Proof of Delivery',     applies: ['US', 'CA', 'MX'] },
  { label: 'Invoice / Settlement',  applies: ['US', 'CA', 'MX'] },
  { label: 'FMCSA authority on doc',applies: ['US'] },
  { label: 'NSC number on doc',     applies: ['CA'] },
  { label: 'Permiso SCT on doc',    applies: ['MX'] },
];

export default function UsmcaPage() {
  return (
    <div style={{ fontFamily: FONT }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${B.navy} 0%, #0D3B53 60%, #083344 100%)`,
        padding: '88px 24px 72px',
      }}>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,150,199,0.18)', border: '1px solid rgba(0,150,199,0.35)',
            borderRadius: 20, padding: '6px 14px', marginBottom: 28,
          }}>
            <span style={{ fontSize: 18 }}>🇺🇸🇨🇦🇲🇽</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: B.tealLt, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              USMCA — North America
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, color: B.white, lineHeight: 1.1, marginBottom: 20 }}>
            One Platform. Three Countries.<br />Full Compliance.
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 36px' }}>
            Shipmater is built for the USMCA trade corridor from day one — separate regulatory compliance, GPS tracking, background checks, and payouts for US, Canadian, and Mexican carriers and shippers.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: B.teal, color: B.white, fontWeight: 600, fontSize: 15,
              padding: '12px 28px', borderRadius: 7, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Get started <ArrowRight size={15} />
            </Link>
            <Link href="/coverage" style={{
              background: 'rgba(255,255,255,0.1)', color: B.white, fontWeight: 600, fontSize: 15,
              padding: '12px 28px', borderRadius: 7, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)',
            }}>
              View all country coverage
            </Link>
          </div>
        </div>
      </section>

      {/* ── Country cards ────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: B.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: B.text, textAlign: 'center', marginBottom: 56 }}>
            Country-Specific Compliance
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {COUNTRIES.map((c, i) => (
              <div key={i} style={{ border: `1px solid ${B.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ background: c.color, padding: '24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{c.flag}</span>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: B.white }}>{c.name}</h3>
                </div>
                <div style={{ padding: '20px 24px', background: B.white }}>
                  {[
                    ['Operating Authority', c.authority],
                    ['Driving Licence',     c.licence],
                    ['Background Check',    c.bgCheck],
                    ['Clearinghouse',       c.clearinghouse],
                    ['Payouts',            c.payout],
                    ['GPS Tracking',        c.gps],
                  ].map(([k, v]) => (
                    <div key={k} style={{ borderBottom: `1px solid ${B.border}`, paddingBottom: 10, marginBottom: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: B.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{k}</p>
                      <p style={{ fontSize: 13, color: B.text, lineHeight: 1.5 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How cross-border works ───────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: B.cream }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: B.text, textAlign: 'center', marginBottom: 12 }}>
            How Cross-Border Onboarding Works
          </h2>
          <p style={{ fontSize: 16, color: B.muted, textAlign: 'center', marginBottom: 56, maxWidth: 520, margin: '0 auto 56px' }}>
            Everything adapts automatically based on where the carrier operates.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {CROSSBORDER.map((s, i) => (
              <div key={i} style={{
                background: B.white, border: `1px solid ${B.border}`, borderRadius: 12,
                padding: '24px 28px', display: 'flex', gap: 20,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: B.teal, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, color: B.white,
                }}>
                  {s.step}
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: B.text, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: B.muted, lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Documents ────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: B.white }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: B.text, textAlign: 'center', marginBottom: 12 }}>
            Documents for Every Country
          </h2>
          <p style={{ fontSize: 15, color: B.muted, textAlign: 'center', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
            All PDF documents are tenant-branded and auto-populate the correct authority numbers based on the carrier's operating country.
          </p>
          <div style={{ border: `1px solid ${B.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: B.cream }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Document</th>
                  {['🇺🇸 US', '🇨🇦 CA', '🇲🇽 MX'].map(c => (
                    <th key={c} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: B.text }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DOCS.map((d, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${B.border}`, background: i % 2 === 0 ? B.white : B.cream }}>
                    <td style={{ padding: '12px 20px', fontSize: 14, color: B.text, fontWeight: 500 }}>{d.label}</td>
                    {['US', 'CA', 'MX'].map(c => (
                      <td key={c} style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {d.applies.includes(c)
                          ? <CheckCircle2 size={16} color={B.teal} style={{ display: 'inline' }} />
                          : <span style={{ color: B.border, fontSize: 18 }}>–</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section style={{ background: B.teal, padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, color: B.white, marginBottom: 16 }}>
          Operating in the USMCA corridor?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 32 }}>
          Register once. Your profile adapts to the country you operate in.
        </p>
        <Link href="/register" style={{
          background: B.white, color: B.teal, fontWeight: 700, fontSize: 15,
          padding: '13px 36px', borderRadius: 7, textDecoration: 'none', display: 'inline-block',
        }}>
          Create your profile
        </Link>
      </section>

    </div>
  );
}
