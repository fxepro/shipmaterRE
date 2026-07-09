import Link from 'next/link';
import {
  CheckCircle2, ArrowRight, Globe, ShieldCheck, CreditCard,
  MapPin, FileText, Truck, Star, Users,
} from 'lucide-react';

const B = { navy:'#0A2E40', teal:'#0096C7', tealLt:'#90E0EF', cream:'#F0F4F7', white:'#FFFFFF', text:'#1A2B3C', muted:'#64748B', border:'#E2ECF0' };
const FONT = "'Roboto','IBM Plex Sans',system-ui,sans-serif";

const CREDS = [
  {
    flag: '🇺🇸',
    country: 'United States',
    authority: 'USDOT + MC Number (FMCSA)',
    licence: 'CDL Class A, B or C',
    id: 'SSN or ITIN (last 4 for platform)',
    bgCheck: 'Full FMCSA + criminal (Checkr)',
  },
  {
    flag: '🇨🇦',
    country: 'Canada',
    authority: 'NSC Number (National Safety Code)',
    licence: 'Class 1, 2, 3 or 4 (provincial)',
    id: 'Provincial driver\'s licence',
    bgCheck: 'Provincial criminal records (Checkr)',
  },
  {
    flag: '🇲🇽',
    country: 'Mexico',
    authority: 'Permiso SCT (SICT)',
    licence: 'Licencia Federal Tipo C or E',
    id: 'INE / Pasaporte',
    bgCheck: 'Adverse media + RENAPO (Checkr)',
  },
  {
    flag: '🇬🇧🇩🇪🇫🇷',
    country: 'EU / UK',
    authority: 'Community Licence (EU) / Operator Licence (UK)',
    licence: 'Category C or C+E',
    id: 'Passport or national ID',
    bgCheck: 'Criminal background (Checkr EU)',
  },
  {
    flag: '🌍',
    country: 'All Other Countries',
    authority: 'National transport authority document (upload)',
    licence: 'National HGV / truck licence',
    id: 'Passport — verified via Stripe Identity',
    bgCheck: 'Adverse media + sanctions screening',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Register and choose your operating country',
    desc: 'The platform immediately adapts — showing the right authority number fields, licence categories, and ID formats for your country.',
  },
  {
    num: '02',
    title: 'Verify your identity with Stripe Identity',
    desc: 'Upload your government-issued ID (passport, driver\'s licence, or national ID card). Stripe\'s selfie match and liveness check covers 100+ countries in minutes.',
  },
  {
    num: '03',
    title: 'Submit your operating credentials',
    desc: 'Enter your DOT/NSC/Permiso SCT number or upload your operating authority document. For US carriers, FMCSA data is automatically cross-referenced.',
  },
  {
    num: '04',
    title: 'Pass the background check',
    desc: 'Checkr automatically routes the check by country — full criminal + driving record for USMCA, adverse media for all others. US only: FMCSA Drug & Alcohol Clearinghouse.',
  },
  {
    num: '05',
    title: 'Connect your bank for payouts',
    desc: 'Stripe Connect supports local bank payouts in 46+ countries — USD, CAD, MXN, GBP, EUR, AUD, and more. No wire transfers.',
  },
  {
    num: '06',
    title: 'Start accepting jobs',
    desc: 'Once approved, your profile is visible to shippers. Jobs matched to your service type and operating region appear on your board.',
  },
];

const BENEFITS = [
  { icon: Globe,       title: 'Verified in 100+ countries',   desc: 'Stripe Identity accepts government IDs from over 100 countries. Carry your credentials digitally.' },
  { icon: CreditCard,  title: 'Pay out in local currency',     desc: 'Receive earnings directly to your bank — CAD, MXN, GBP, EUR, AUD, and more.' },
  { icon: MapPin,      title: 'GPS works everywhere',          desc: 'Phone GPS tracking works across the US, Canada, and Mexico without any extra app or hardware.' },
  { icon: FileText,    title: 'Documents in your format',      desc: 'BOL and POD documents use your country\'s authority number format automatically.' },
  { icon: ShieldCheck, title: 'One profile, any country',      desc: 'Update your operating country at any time. Your verification status follows you.' },
  { icon: Star,        title: 'Build a global reputation',     desc: 'Ratings are portable. A 5-star record in Canada is visible to US shippers and vice versa.' },
];

const FAQS = [
  {
    q: 'I\'m based in Canada — can I accept US loads?',
    a: 'Yes. If you hold a valid USDOT + MC number and US CDL, you can accept US-origin loads. Simply add a secondary operating country in your profile.',
  },
  {
    q: 'Do I need a US Social Security Number to register?',
    a: 'No. SSN is only collected for Stripe Connect tax purposes if you operate in the US. For Canada, Mexico, and international carriers, your local bank account and national ID are sufficient.',
  },
  {
    q: 'How long does verification take outside the US?',
    a: 'Stripe Identity typically completes in 2–5 minutes. Background checks for non-US carriers (adverse media + sanctions) usually complete within an hour. Manual document review adds 1–2 business days.',
  },
  {
    q: 'What if my country isn\'t in the coverage table?',
    a: 'You can still register. Stripe Identity covers 100+ countries for ID verification. You can upload your transport licence manually. Payout availability depends on whether Stripe Connect operates in your country.',
  },
  {
    q: 'Are payouts in my local currency?',
    a: 'Where Stripe Connect supports your country, yes — you receive earnings in your local currency to your local bank account. For countries where Stripe Connect isn\'t available, USD wire or alternative settlement can be arranged.',
  },
];

export default function InternationalCarriersPage() {
  return (
    <div style={{ fontFamily: FONT }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${B.navy} 0%, #0D3B53 60%, #0A5071 100%)`,
        padding: '88px 24px 72px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,150,199,0.18)', border: '1px solid rgba(0,150,199,0.35)',
            borderRadius: 20, padding: '6px 14px', marginBottom: 28,
          }}>
            <Globe size={14} color={B.tealLt} />
            <span style={{ fontSize: 12, fontWeight: 600, color: B.tealLt, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              International Carriers
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, color: B.white, lineHeight: 1.1, marginBottom: 20 }}>
            Join Shipmater<br />From Anywhere in the World
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 36px' }}>
            Whether you're based in Toronto, Mexico City, Berlin, or Sydney — the platform adapts to your credentials, currency, and compliance requirements.
          </p>
          <Link href="/register?role=carrier" style={{
            background: B.teal, color: B.white, fontWeight: 600, fontSize: 15,
            padding: '13px 32px', borderRadius: 7, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Register as a carrier <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────── */}
      <section style={{ background: B.teal }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              { v: '100+', l: 'countries for ID verification' },
              { v: '46+',  l: 'countries for local bank payouts' },
              { v: '223',  l: 'countries with background checks' },
              { v: '3',    l: 'USMCA countries — full platform' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '28px 20px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.25)' : 'none',
              }}>
                <p style={{ fontSize: 36, fontWeight: 800, color: B.white, lineHeight: 1 }}>{s.v}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 6, fontWeight: 500 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Credentials by country ───────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: B.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: B.text, textAlign: 'center', marginBottom: 12 }}>
            What Credentials You Need
          </h2>
          <p style={{ fontSize: 15, color: B.muted, textAlign: 'center', marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
            The platform shows you exactly what to upload based on your operating country.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {CREDS.map((c, i) => (
              <div key={i} style={{
                border: `1px solid ${B.border}`, borderRadius: 12, padding: '24px',
                background: i < 3 ? B.white : B.cream,
              }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>{c.flag}</p>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: B.text, marginBottom: 16 }}>{c.country}</h3>
                {[
                  ['Authority',       c.authority],
                  ['Licence',         c.licence],
                  ['ID accepted',     c.id],
                  ['Background check', c.bgCheck],
                ].map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</p>
                    <p style={{ fontSize: 13, color: B.text, lineHeight: 1.5 }}>{v}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to register ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: B.cream }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: B.text, textAlign: 'center', marginBottom: 56 }}>
            How to Get Started
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                background: B.white, border: `1px solid ${B.border}`, borderRadius: 12,
                padding: '22px 24px', display: 'flex', gap: 18, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 9, background: B.teal, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 12, color: B.white,
                }}>
                  {s.num}
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: B.text, marginBottom: 4 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: B.muted, lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: B.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: B.text, textAlign: 'center', marginBottom: 48 }}>
            Why International Carriers Choose Shipmater
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{ border: `1px solid ${B.border}`, borderRadius: 12, padding: '24px' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#E0F4FA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <b.icon size={19} color={B.teal} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: B.text, marginBottom: 6 }}>{b.title}</h3>
                <p style={{ fontSize: 13, color: B.muted, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: B.cream }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: B.text, textAlign: 'center', marginBottom: 48 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((f, i) => (
              <details key={i} style={{
                background: B.white, border: `1px solid ${B.border}`, borderRadius: 10,
                padding: '16px 20px', cursor: 'pointer',
              }}>
                <summary style={{ fontSize: 15, fontWeight: 600, color: B.text, listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  {f.q}
                  <span style={{ color: B.teal, flexShrink: 0, marginLeft: 12 }}>+</span>
                </summary>
                <p style={{ fontSize: 14, color: B.muted, lineHeight: 1.7, marginTop: 12 }}>{f.a}</p>
              </details>
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
          Ready to haul across borders?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 36 }}>
          Join free — no monthly subscription. Earn on every delivery.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/register?role=carrier" style={{
            background: B.teal, color: B.white, fontWeight: 600, fontSize: 15,
            padding: '13px 32px', borderRadius: 7, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Create carrier account <ArrowRight size={15} />
          </Link>
          <Link href="/coverage" style={{
            background: 'transparent', color: B.white, fontWeight: 600, fontSize: 15,
            padding: '13px 32px', borderRadius: 7, textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            Check your country
          </Link>
        </div>
      </section>

    </div>
  );
}
