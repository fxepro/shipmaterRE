'use client';

import { useState, useRef } from 'react';
import {
  ArrowRight, Check, Minus, Building2, Layers, Server,
  ShieldCheck, Globe, Rocket, Lock, CheckCircle2,
} from 'lucide-react';
import { marketingApi } from '@/lib/api';

// ── Palette / type (marketing system — IBM Plex Sans, inline) ─────────────────
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
  gray20:   '#E0E0E0',
  gray10:   '#F4F4F4',
  white:    '#FFFFFF',
  green:    '#1B9C6B',
};
const T = {
  hero: 'clamp(34px, 5vw, 52px)' as string | number,
  h2:   'clamp(26px, 3.5vw, 34px)' as string | number,
  h3:   22,
  body: 16,
  label: 13,
};
const IBM = "'IBM Plex Sans', system-ui, sans-serif";

// ── Tiers ─────────────────────────────────────────────────────────────────────
const TIERS = [
  {
    id:    'startup',
    icon:  Rocket,
    name:  'Startup',
    tag:   'Shared instance · white-label',
    who:   'Brokers and 3PLs launching their own branded platform fast, with minimal upfront cost.',
    points: [
      'White-label branding — your logo, your colors',
      'Shared multi-tenant instance, row-level data isolation',
      'Standard integrations & support',
      'Self-serve onboarding — live in weeks',
    ],
    featured: false,
  },
  {
    id:    'growth',
    icon:  Layers,
    name:  'Growth',
    tag:   'Dedicated database · shared compute',
    who:   'Scaling brokerages that need real data isolation, custom domains and deeper integrations.',
    points: [
      'Everything in Startup, plus:',
      'Dedicated database — your data, isolated',
      'Custom domain + SSO / SAML',
      'API access & priority support',
    ],
    featured: true,
  },
  {
    id:    'enterprise',
    icon:  Server,
    name:  'Enterprise',
    tag:   'Dedicated instance · dedicated server',
    who:   'Large operators that require full isolation, compliance, SLAs and white-glove delivery.',
    points: [
      'Everything in Growth, plus:',
      'Dedicated instance on a dedicated server / VPC',
      'SOC2, data residency & on-prem option',
      'Dedicated success manager + SLA',
    ],
    featured: false,
  },
];

// ── Comparison matrix ───────────────────────────────────────────────────────
type Cell = boolean | string;
const MATRIX: { label: string; vals: [Cell, Cell, Cell] }[] = [
  { label: 'Isolation model',     vals: ['Shared, row-level', 'Dedicated database', 'Dedicated instance'] },
  { label: 'White-label branding', vals: [true, true, true] },
  { label: 'Custom domain',        vals: [false, true, true] },
  { label: 'Fully unbranded (no "powered by")', vals: [false, false, true] },
  { label: 'User / volume limits', vals: ['Capped', 'Higher caps', 'Unlimited'] },
  { label: 'SSO / SAML',           vals: [false, true, true] },
  { label: 'Integrations',         vals: ['Standard', 'API access', 'Custom + EDI'] },
  { label: 'Support',              vals: ['Email', 'Priority', 'Dedicated CSM + SLA'] },
  { label: 'Compliance',           vals: ['Basic', 'DPA', 'SOC2 · residency · on-prem'] },
  { label: 'Payments',             vals: ['Platform-managed', 'Your Stripe Connect', 'Your merchant account'] },
  { label: 'Onboarding',           vals: ['Self-serve', 'Guided', 'White-glove'] },
];

const FAQ = [
  { q: 'Whose brand do customers see?', a: 'Yours. Every tier is white-label — your logo, colors and (from Growth up) your own domain. On Enterprise there is no "powered by" anywhere.' },
  { q: 'Who is the broker / operator of record?', a: 'You are. The platform is the software underneath — you operate under your own authority and agreements. We build the product to support that structure.' },
  { q: 'How is my data isolated?', a: 'Startup shares one instance with row-level separation. Growth gives you a dedicated database. Enterprise runs on a dedicated instance and server / VPC — fully isolated.' },
  { q: 'How fast can we launch?', a: 'Startup and Growth typically go live in weeks. Enterprise depends on the infrastructure and compliance scope — we scope it with you.' },
  { q: 'How does pricing work?', a: 'Pricing is tailored to your tier, volume and isolation needs. Tell us what you need below and we will put together a proposal.' },
];

// ── UI bits ─────────────────────────────────────────────────────────────────
function MatrixCell({ v }: { v: Cell }) {
  if (v === true)  return <Check size={17} style={{ color: B.green }} />;
  if (v === false) return <Minus size={15} style={{ color: B.gray50 }} />;
  return <span style={{ fontFamily: IBM, fontSize: 13.5, color: B.gray90 }}>{v}</span>;
}

const inputStyle = {
  width: '100%', fontFamily: IBM, fontSize: 15, color: B.gray100,
  background: B.white, border: `1px solid ${B.gray20}`, borderRadius: 8,
  padding: '11px 14px', outline: 'none', boxSizing: 'border-box' as const,
};

export default function PlatformPage() {
  const [plan, setPlan]       = useState('growth');
  const [status, setStatus]   = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError]     = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const selectPlan = (id: string) => {
    setPlan(id);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      await marketingApi.submitLead(payload);
      setStatus('done');
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again or email us directly.');
    }
  }

  return (
    <div style={{ fontFamily: IBM, color: B.gray100, background: B.white }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(155deg, ${B.darkSec} 0%, ${B.darkCard} 100%)`, color: B.white }}>
        <div className="mx-auto max-w-[1080px] px-6 py-24 text-center">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(144,224,239,0.12)', color: B.teal, fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999, marginBottom: 22 }}>
            <Building2 size={13} /> White-Label Platform
          </span>
          <h1 style={{ fontFamily: IBM, fontSize: T.hero, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 20, color: B.white }}>
            Launch your own freight platform —<br />under your brand, not ours.
          </h1>
          <p style={{ fontFamily: IBM, fontSize: 19, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', maxWidth: 660, margin: '0 auto 32px' }}>
            Everything you need to run a branded dispatch, tracking and settlement platform —
            without building it. You operate; we power it.
          </p>
          <button onClick={() => selectPlan('growth')}
            style={{ background: B.tealDark, color: B.white, fontFamily: IBM, fontSize: 16, fontWeight: 600, padding: '14px 30px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Talk to sales <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ── Value props ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1080px] px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: Globe,      title: 'Your brand, end to end', desc: 'Your logo, colors, domain and documents. Customers never see us.' },
            { icon: ShieldCheck, title: 'You stay the operator',  desc: 'Run under your own authority and agreements. We are the infrastructure beneath you.' },
            { icon: Lock,        title: 'Isolation on your terms', desc: 'Shared, dedicated database, or a fully dedicated instance — pick your level.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: B.tealBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={21} style={{ color: B.tealDark }} />
              </div>
              <h3 style={{ fontFamily: IBM, fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{title}</h3>
              <p style={{ fontFamily: IBM, fontSize: 15, lineHeight: 1.6, color: B.gray70 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tiers ─────────────────────────────────────────────────────────── */}
      <section style={{ background: B.gray10 }}>
        <div className="mx-auto max-w-[1080px] px-6 py-20">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: IBM, fontSize: T.h2, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Three ways to run it
            </h2>
            <p style={{ fontFamily: IBM, fontSize: 17, color: B.gray70, maxWidth: 560, margin: '0 auto' }}>
              The same platform, at the level of isolation and control you need. Every plan is white-label.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              return (
                <div key={tier.id}
                  style={{
                    background: B.white, borderRadius: 14, padding: '32px 28px',
                    border: tier.featured ? `2px solid ${B.tealDark}` : `1px solid ${B.gray20}`,
                    boxShadow: tier.featured ? '0 16px 40px rgba(0,150,199,0.14)' : '0 1px 3px rgba(0,0,0,0.05)',
                    position: 'relative', display: 'flex', flexDirection: 'column',
                  }}>
                  {tier.featured && (
                    <span style={{ position: 'absolute', top: -12, left: 28, background: B.tealDark, color: B.white, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999 }}>
                      Most popular
                    </span>
                  )}
                  <div style={{ width: 46, height: 46, borderRadius: 11, background: B.tealBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon size={22} style={{ color: B.tealDark }} />
                  </div>
                  <h3 style={{ fontFamily: IBM, fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{tier.name}</h3>
                  <p style={{ fontFamily: IBM, fontSize: 13, fontWeight: 600, color: B.tealDark, marginBottom: 16 }}>{tier.tag}</p>
                  <p style={{ fontFamily: IBM, fontSize: 14.5, lineHeight: 1.6, color: B.gray70, marginBottom: 20 }}>{tier.who}</p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
                    {tier.points.map((p) => (
                      <li key={p} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                        <CheckCircle2 size={16} style={{ color: B.tealDark, flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontFamily: IBM, fontSize: 14, lineHeight: 1.5, color: B.gray90 }}>{p}</span>
                      </li>
                    ))}
                  </ul>

                  <button onClick={() => selectPlan(tier.id)}
                    style={{
                      width: '100%', fontFamily: IBM, fontSize: 15, fontWeight: 600, padding: '12px', borderRadius: 8, cursor: 'pointer',
                      border: tier.featured ? 'none' : `1px solid ${B.tealDark}`,
                      background: tier.featured ? B.tealDark : B.white,
                      color: tier.featured ? B.white : B.tealDark,
                    }}>
                    Talk to sales
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Comparison matrix ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1080px] px-6 py-20">
        <h2 style={{ fontFamily: IBM, fontSize: T.h2, fontWeight: 700, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 40 }}>
          Compare the plans
        </h2>
        <div style={{ overflowX: 'auto', border: `1px solid ${B.gray20}`, borderRadius: 14 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr style={{ background: B.tealBg }}>
                <th style={{ textAlign: 'left', fontFamily: IBM, fontSize: 13, fontWeight: 700, color: B.darkSec, padding: '16px 20px' }}>Capability</th>
                {['Startup', 'Growth', 'Enterprise'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: IBM, fontSize: 14, fontWeight: 700, color: B.darkSec, padding: '16px 20px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row, i) => (
                <tr key={row.label} style={{ borderTop: `1px solid ${B.gray20}`, background: i % 2 ? B.gray10 : B.white }}>
                  <td style={{ fontFamily: IBM, fontSize: 14, fontWeight: 500, color: B.gray90, padding: '14px 20px' }}>{row.label}</td>
                  {row.vals.map((v, j) => (
                    <td key={j} style={{ padding: '14px 20px' }}><MatrixCell v={v} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section style={{ background: B.gray10 }}>
        <div className="mx-auto max-w-[1080px] px-6 py-20">
          <h2 style={{ fontFamily: IBM, fontSize: T.h2, fontWeight: 700, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 40 }}>
            Common questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQ.map(({ q, a }) => (
              <div key={q} style={{ background: B.white, border: `1px solid ${B.gray20}`, borderRadius: 12, padding: '20px 24px' }}>
                <p style={{ fontFamily: IBM, fontSize: 16, fontWeight: 600, color: B.gray100, marginBottom: 7 }}>{q}</p>
                <p style={{ fontFamily: IBM, fontSize: 15, lineHeight: 1.6, color: B.gray70 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lead form ─────────────────────────────────────────────────────── */}
      <section ref={formRef} style={{ background: `linear-gradient(155deg, ${B.darkSec} 0%, ${B.darkCard} 100%)`, color: B.white }}>
        <div className="mx-auto max-w-[1080px] px-6 py-24">
          {status === 'done' ? (
            <div className="text-center">
              <div style={{ width: 64, height: 64, borderRadius: 999, background: 'rgba(27,156,107,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={32} style={{ color: '#4ADE80' }} />
              </div>
              <h2 style={{ fontFamily: IBM, fontSize: 28, fontWeight: 700, marginBottom: 12, color: B.white }}>Thanks — we&rsquo;ll be in touch.</h2>
              <p style={{ fontFamily: IBM, fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>
                Our team will reach out within one business day to scope your platform.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center" style={{ marginBottom: 36 }}>
                <h2 style={{ fontFamily: IBM, fontSize: T.h2, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12, color: B.white }}>
                  Let&rsquo;s talk
                </h2>
                <p style={{ fontFamily: IBM, fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>
                  Tell us what you&rsquo;re building. We&rsquo;ll put together a proposal.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ background: B.white, borderRadius: 14, padding: '32px 28px' }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" name="name" required placeholder="Jane Smith" />
                  <Field label="Work email" name="email" type="email" required placeholder="jane@company.com" />
                  <Field label="Company" name="company" required placeholder="Acme Logistics" />
                  <Field label="Role" name="role" placeholder="Operations Director" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2" style={{ marginTop: 16 }}>
                  <Select label="Plan of interest" name="plan" value={plan} onChange={setPlan}
                    options={[['startup', 'Startup'], ['growth', 'Growth'], ['enterprise', 'Enterprise'], ['unsure', 'Not sure yet']]} />
                  <Select label="Monthly shipment volume" name="monthly_volume" defaultValue=""
                    options={[['', 'Select…'], ['<100', 'Under 100'], ['100-500', '100 – 500'], ['500-2000', '500 – 2,000'], ['2000+', '2,000+']]} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2" style={{ marginTop: 16 }}>
                  <Field label="Current solution" name="current_solution" placeholder="Spreadsheets, TMS, in-house…" />
                  <Select label="Timeline" name="timeline" defaultValue=""
                    options={[['', 'Select…'], ['asap', 'ASAP'], ['1-3m', '1 – 3 months'], ['3-6m', '3 – 6 months'], ['exploring', 'Just exploring']]} />
                </div>

                <div style={{ marginTop: 16 }}>
                  <label style={labelStyle}>Anything else?</label>
                  <textarea name="message" rows={3} placeholder="What are you trying to launch?"
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                {status === 'error' && (
                  <p style={{ fontFamily: IBM, fontSize: 13, color: '#DC2626', marginTop: 14 }}>{error}</p>
                )}

                <button type="submit" disabled={status === 'sending'}
                  style={{
                    width: '100%', marginTop: 22, fontFamily: IBM, fontSize: 16, fontWeight: 600,
                    color: B.white, background: status === 'sending' ? B.gray50 : B.tealDark,
                    border: 'none', borderRadius: 8, padding: '13px', cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  }}>
                  {status === 'sending' ? 'Sending…' : 'Request a proposal'}
                </button>
                <p style={{ fontFamily: IBM, fontSize: 12, color: B.gray50, textAlign: 'center', marginTop: 12 }}>
                  No spam. We&rsquo;ll only use this to contact you about your platform.
                </p>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Form field helpers ────────────────────────────────────────────────────────
const labelStyle = { display: 'block', fontFamily: IBM, fontSize: 13, fontWeight: 600, color: B.gray70, marginBottom: 6 };

function Field({ label, name, type = 'text', required, placeholder }: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: B.tealDark }}> *</span>}</label>
      <input name={name} type={type} required={required} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function Select({ label, name, options, value, defaultValue, onChange }: {
  label: string; name: string; options: [string, string][];
  value?: string; defaultValue?: string; onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
