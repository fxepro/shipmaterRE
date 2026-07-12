'use client';

import Link from 'next/link';
import {
  CheckCircle2, X, ArrowRight, Zap, Building2, Sparkles,
  CreditCard, FileText, MapPin, ShieldCheck, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { T } from '@/lib/type-scale';


// ── Design tokens ─────────────────────────────────────────────────────────────
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
  amber:    '#D97706',
};
const BODY = 'var(--font-body)';
const DISPLAY = 'var(--font-display)';

// ── Pricing plans ─────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    badge: null,
    price: '$0',
    period: '/month',
    desc: 'Everything you need to start shipping freight.',
    cta: 'Start for free',
    ctaHref: '/register',
    ctaStyle: 'outline',
    color: B.tealDark,
    icon: Zap,
    features: [
      'Up to 3 active shipments',
      '1 admin user',
      'Standard 5% platform fee',
      'Email support',
      'Basic shipment tracking',
      'BOL & POD documents',
      'Stripe carrier payouts',
      'Real-time GPS tracking',
    ],
    missing: [
      'Advanced analytics',
      'Custom rate templates',
      'API access',
      'Priority support & SLA',
      'SSO (SAML/OIDC)',
      'White-label option',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Most Popular',
    price: '$149',
    period: '/month',
    desc: 'For growing brokerages ready to scale their operations.',
    cta: 'Start Pro trial',
    ctaHref: '/register?plan=pro',
    ctaStyle: 'solid',
    color: B.tealMid,
    icon: Sparkles,
    features: [
      'Unlimited shipments',
      'Up to 10 users',
      'Reduced 3% platform fee',
      'Priority support + SLA',
      'Advanced analytics',
      'Custom rate templates',
      'API access',
      'BOL & POD documents',
      'Stripe carrier payouts',
      'Real-time GPS tracking',
      'Identity verification',
    ],
    missing: [
      'SSO (SAML/OIDC)',
      'White-label option',
      'Dedicated account manager',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: null,
    price: 'Custom',
    period: 'pricing',
    desc: 'For large brokerages with complex needs and high volumes.',
    cta: 'Talk to sales',
    ctaHref: '/contact?intent=enterprise',
    ctaStyle: 'outline',
    color: B.tealNavy,
    icon: Building2,
    features: [
      'Unlimited shipments',
      'Unlimited users',
      'Negotiated fee (as low as 1%)',
      'Dedicated account manager',
      'SSO (SAML/OIDC)',
      'White-label option',
      'SLA 99.9% uptime',
      'Custom integrations',
      'BOL & POD documents',
      'Stripe carrier payouts',
      'Real-time GPS tracking',
      'Identity verification',
      'Advanced analytics',
      'API access',
    ],
    missing: [],
  },
];

// ── Feature comparison table ───────────────────────────────────────────────────

const COMPARISON = [
  { feature: 'Active shipments',          starter: 'Up to 3',       pro: 'Unlimited',        enterprise: 'Unlimited' },
  { feature: 'Users',                     starter: '1 admin',        pro: 'Up to 10',          enterprise: 'Unlimited' },
  { feature: 'Platform fee',              starter: '5%',             pro: '3%',                enterprise: 'As low as 1%' },
  { feature: 'BOL & POD documents',       starter: true,             pro: true,                enterprise: true },
  { feature: 'Stripe carrier payouts',    starter: true,             pro: true,                enterprise: true },
  { feature: 'Real-time GPS tracking',    starter: true,             pro: true,                enterprise: true },
  { feature: 'Identity verification',     starter: true,             pro: true,                enterprise: true },
  { feature: 'Email support',             starter: true,             pro: true,                enterprise: true },
  { feature: 'Priority support + SLA',    starter: false,            pro: true,                enterprise: true },
  { feature: 'Advanced analytics',        starter: false,            pro: true,                enterprise: true },
  { feature: 'Custom rate templates',     starter: false,            pro: true,                enterprise: true },
  { feature: 'API access',               starter: false,            pro: true,                enterprise: true },
  { feature: 'SSO (SAML/OIDC)',          starter: false,            pro: false,               enterprise: true },
  { feature: 'White-label option',        starter: false,            pro: false,               enterprise: true },
  { feature: 'Dedicated account manager', starter: false,            pro: false,               enterprise: true },
  { feature: 'Custom integrations',       starter: false,            pro: false,               enterprise: true },
  { feature: 'SLA 99.9% uptime',         starter: false,            pro: false,               enterprise: true },
];

// ── FAQ ────────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What is the platform fee?',
    a: 'The platform fee is a percentage charged on each load moved through Shipmater. It covers payment processing, identity verification, document management, and platform infrastructure. Starter plans pay 5%, Pro plans pay 3%, and Enterprise plans can negotiate rates as low as 1% based on volume.',
  },
  {
    q: 'Can I cancel my subscription at any time?',
    a: 'Yes. You can cancel your Pro or Enterprise subscription at any time from your account settings. Your plan stays active until the end of the current billing period. There are no cancellation fees or long-term contracts for Pro. Enterprise contracts vary — speak to your account manager.',
  },
  {
    q: 'Is there a free trial for the Pro plan?',
    a: 'Yes. Pro comes with a 14-day free trial, no credit card required. You get full access to all Pro features during the trial. After 14 days, you can choose to subscribe or downgrade to Starter.',
  },
  {
    q: 'How does billing work for the platform fee?',
    a: 'Platform fees are charged per load when the carrier payout is processed through Stripe. They are deducted automatically from the load payment before the carrier receives their funds. You\'ll see an itemized breakdown for every transaction in your billing dashboard.',
  },
  {
    q: 'What\'s included in all plans at no extra cost?',
    a: 'All plans — including the free Starter plan — include Stripe carrier payouts, BOL/POD document generation, real-time GPS tracking, and carrier identity verification powered by Stripe Identity.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes. You can upgrade from Starter to Pro immediately with prorated billing. Downgrades take effect at the next billing cycle. Enterprise upgrades require a brief onboarding call with our team.',
  },
];

// ── FAQ Item ──────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: `1px solid ${B.gray20}`,
        padding: '18px 0',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          gap: 16,
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: B.darkCard, lineHeight: 1.4 }}>{q}</span>
        <ChevronDown
          size={18}
          color={B.gray70}
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        />
      </button>
      {open && (
        <p style={{ fontSize: 15, color: B.gray70, lineHeight: 1.75, margin: '12px 0 0' }}>{a}</p>
      )}
    </div>
  );
}

// ── Included everywhere strip ─────────────────────────────────────────────────

const INCLUDED = [
  { icon: CreditCard,  label: 'Stripe carrier payouts' },
  { icon: FileText,    label: 'BOL / POD documents' },
  { icon: MapPin,      label: 'Real-time GPS tracking' },
  { icon: ShieldCheck, label: 'Identity verification' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div style={{ fontFamily: BODY, background: B.white, color: B.darkCard }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)`, padding: 'clamp(64px, 8vw, 112px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(144,224,239,0.12)', border: '1px solid rgba(144,224,239,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 24 }}>
            <Sparkles size={14} color={B.teal} />
            <span style={{ fontSize: 12, fontWeight: 600, color: B.teal, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Pricing
            </span>
          </div>
          <h1 style={{ fontSize: T.hero, fontWeight: 700, color: B.white, lineHeight: 1.15, margin: '0 0 20px' }}>
            Simple, transparent pricing.<br />
            <span style={{ color: B.tealMid }}>Scale as you grow.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 0' }}>
            Start free and upgrade when you need to. No hidden fees, no surprise charges — just straightforward pricing that grows with your brokerage.
          </p>
        </div>
      </section>

      {/* ── Included in all plans strip ──────────────────────────────────────── */}
      <section style={{ background: B.tealNavy, borderBottom: `1px solid rgba(144,224,239,0.15)` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: B.teal, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 8 }}>
            All plans include:
          </span>
          {INCLUDED.map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(144,224,239,0.1)', border: '1px solid rgba(144,224,239,0.2)', borderRadius: 99, padding: '5px 12px' }}>
              <Icon size={12} color={B.tealMid} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing cards ────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'start' }}>
          {PLANS.map(plan => {
            const Icon = plan.icon;
            const isPro = plan.id === 'pro';
            return (
              <div
                key={plan.id}
                style={{
                  background: isPro ? `linear-gradient(160deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)` : B.gray10,
                  border: isPro ? `2px solid ${B.tealMid}` : `1px solid ${B.gray20}`,
                  borderRadius: 20,
                  padding: 'clamp(24px, 3vw, 36px)',
                  position: 'relative',
                  boxShadow: isPro ? `0 0 40px rgba(72,202,228,0.18)` : 'none',
                }}
              >
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: B.tealMid, color: B.tealNavy, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 99, padding: '4px 14px', whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: isPro ? 'rgba(144,224,239,0.15)' : plan.color + '18', border: `1.5px solid ${isPro ? 'rgba(144,224,239,0.3)' : plan.color + '30'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={isPro ? B.tealMid : plan.color} />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: isPro ? B.white : B.darkCard }}>{plan.name}</span>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 'clamp(34px, 4vw, 44px)', fontWeight: 800, color: isPro ? B.white : B.darkCard, lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: isPro ? 'rgba(255,255,255,0.55)' : B.gray70, marginLeft: 4 }}>{plan.period}</span>
                </div>

                <p style={{ fontSize: 14, color: isPro ? 'rgba(255,255,255,0.65)' : B.gray70, lineHeight: 1.6, margin: '0 0 24px' }}>{plan.desc}</p>

                <Link
                  href={plan.ctaHref}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    marginBottom: 24,
                    ...(isPro
                      ? { background: B.tealMid, color: B.tealNavy }
                      : plan.ctaStyle === 'solid'
                        ? { background: B.tealDeep, color: B.white }
                        : { background: 'transparent', color: isPro ? B.white : B.tealDeep, border: `1.5px solid ${isPro ? 'rgba(144,224,239,0.4)' : B.tealDeep}` }),
                  }}
                >
                  {plan.cta} <ArrowRight size={14} />
                </Link>

                <div style={{ borderTop: `1px solid ${isPro ? 'rgba(144,224,239,0.15)' : B.gray20}`, paddingTop: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: isPro ? B.teal : B.tealDark, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 12px' }}>
                    What&apos;s included
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <CheckCircle2 size={14} color={isPro ? B.tealMid : B.green} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: isPro ? 'rgba(255,255,255,0.82)' : B.darkCard }}>{f}</span>
                      </div>
                    ))}
                    {plan.missing.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <X size={14} color={B.gray20} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: isPro ? 'rgba(255,255,255,0.3)' : '#AAAAAA' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Feature comparison table ──────────────────────────────────────────── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px clamp(64px, 8vw, 96px)' }}>
        <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, textAlign: 'center', margin: '0 0 40px' }}>
          Full feature comparison
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: B.gray10, borderBottom: `2px solid ${B.gray20}` }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: 13, fontWeight: 700, color: B.gray70, width: '40%' }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontSize: 13, fontWeight: 700, color: B.tealDark }}>Starter</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontSize: 13, fontWeight: 700, color: B.tealNavy, background: 'rgba(2,62,138,0.05)' }}>Pro</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontSize: 13, fontWeight: 700, color: B.darkCard }}>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.feature} style={{ borderBottom: `1px solid ${B.gray20}`, background: i % 2 === 0 ? B.white : B.gray10 }}>
                  <td style={{ padding: '13px 16px', fontSize: 14, color: B.darkCard }}>{row.feature}</td>
                  {(['starter', 'pro', 'enterprise'] as const).map(plan => (
                    <td key={plan} style={{ textAlign: 'center', padding: '13px 16px', background: plan === 'pro' ? 'rgba(2,62,138,0.04)' : undefined }}>
                      {typeof row[plan] === 'boolean' ? (
                        row[plan]
                          ? <CheckCircle2 size={16} color={B.green} style={{ margin: '0 auto' }} />
                          : <X size={16} color={B.gray20} style={{ margin: '0 auto' }} />
                      ) : (
                        <span style={{ fontSize: 13, color: B.darkCard, fontWeight: 500 }}>{row[plan] as string}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section style={{ background: B.gray10, padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, textAlign: 'center', margin: '0 0 8px' }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: 16, color: B.gray70, textAlign: 'center', margin: '0 0 40px' }}>
            Have a question not listed here? <a href="/contact" style={{ color: B.tealDark, textDecoration: 'none', fontWeight: 600 }}>Contact us</a>.
          </p>
          <div>
            {FAQS.map(faq => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)`, padding: 'clamp(48px, 6vw, 80px) 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.white, margin: '0 0 16px' }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: '0 0 36px' }}>
            Start moving freight for free today. Upgrade to Pro when your business demands it.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/register"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: B.tealMid, color: B.tealNavy, fontWeight: 700, fontSize: 15, padding: '13px 30px', borderRadius: 10, textDecoration: 'none' }}
            >
              Start for free <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact?intent=sales"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: B.white, fontWeight: 600, fontSize: 15, padding: '13px 30px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
