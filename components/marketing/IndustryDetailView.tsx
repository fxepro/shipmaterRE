'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { IndustryPage as IndustryData } from '@/lib/marketing/industries';
import { INDUSTRIES } from '@/lib/marketing/industries';
import { T } from '@/lib/type-scale';

const B = {
  teal:     '#90E0EF',
  tealMid:  '#48CAE4',
  tealDark: '#0096C7',
  tealDeep: '#0077B6',
  tealNavy: '#023E8A',
  tealBg:   '#E0F7FA',
  darkSec:  '#0A2E40',
  gray100:  '#161616',
  gray70:   '#525252',
  gray50:   '#8D8D8D',
  gray20:   '#E0E0E0',
  gray10:   '#F4F4F4',
  white:    '#FFFFFF',
};
const BODY = 'var(--font-body)';
const DISPLAY = 'var(--font-display)';

export function IndustryDetailView({ industry }: { industry: IndustryData }) {
  const Icon = industry.icon;
  const others = INDUSTRIES.filter((i) => i.slug !== industry.slug).slice(0, 4);

  return (
    <div style={{ fontFamily: BODY, background: B.white, WebkitFontSmoothing: 'antialiased' }}>

      {/* Hero — gradient only; photos stay on /industries cards */}
      <section style={{ background: `linear-gradient(145deg, ${B.tealNavy} 0%, ${B.tealDeep} 50%, ${B.tealDark} 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div
          className="absolute inset-0 opacity-[0.05]"
          aria-hidden
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }}
        />
        <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-16 pt-20 md:pt-24">
          <p style={{ fontFamily: BODY, fontSize: T.label, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: B.teal, marginBottom: 14 }}>
            Industries
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: T.hero, lineHeight: 1.08, letterSpacing: '-0.025em', color: B.white, maxWidth: 780 }}>
            {industry.title}
          </h1>
          <p style={{ fontFamily: BODY, fontWeight: 600, fontSize: T.h5, color: B.tealMid, marginTop: 14, maxWidth: 640, lineHeight: 1.35 }}>
            {industry.accent}
          </p>
          <p style={{ fontFamily: BODY, fontSize: T.body, color: 'rgba(255,255,255,0.78)', marginTop: 16, maxWidth: 580, lineHeight: 1.75 }}>
            {industry.subtitle}
          </p>
          <div className="flex flex-wrap gap-3 mt-10">
            <Link
              href="/register"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: B.tealMid, color: B.tealNavy, fontWeight: 700, fontSize: 15, padding: '14px 28px', borderRadius: 6, textDecoration: 'none' }}
              className="hover:opacity-90 transition-opacity"
            >
              Start shipping <ArrowRight size={16} />
            </Link>
            <Link
              href="/industries"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: B.white, fontWeight: 600, fontSize: 15, padding: '14px 28px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.28)', textDecoration: 'none' }}
              className="hover:bg-white/10 transition-colors"
            >
              All industries
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="md:col-span-5">
            <div
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: B.tealBg }}
            >
              <Icon size={22} style={{ color: B.tealDark }} />
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: T.h2, color: B.gray100, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {industry.challengeTitle}
            </h2>
          </div>
          <div className="md:col-span-7">
            <p style={{ fontFamily: BODY, fontSize: T.body, color: B.gray70, lineHeight: 1.8, margin: 0 }}>
              {industry.challenge}
            </p>
          </div>
        </div>
      </section>

      <section style={{ background: B.gray10, borderTop: `1px solid ${B.gray20}`, borderBottom: `1px solid ${B.gray20}` }}>
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
          <p style={{ fontFamily: BODY, fontSize: T.label, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: B.tealDark, marginBottom: 12 }}>
            Platform approach
          </p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: T.h2, color: B.gray100, letterSpacing: '-0.02em', lineHeight: 1.2, maxWidth: 720 }}>
            {industry.approachTitle}
          </h2>
          <p style={{ fontFamily: BODY, fontSize: T.body, color: B.gray70, lineHeight: 1.8, marginTop: 18, maxWidth: 760 }}>
            {industry.approach}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
        <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: T.h2, color: B.gray100, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 36 }}>
          Built for this industry
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {industry.capabilities.map((cap) => (
            <div key={cap.title}>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: T.h5, color: B.gray100, marginBottom: 10, lineHeight: 1.3 }}>
                {cap.title}
              </h3>
              <p style={{ fontFamily: BODY, fontSize: T.body, color: B.gray70, lineHeight: 1.7, margin: 0 }}>
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: `linear-gradient(160deg, #051520 0%, ${B.darkSec} 55%, ${B.tealDeep} 100%)` }}>
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
          <div className="grid md:grid-cols-2 gap-14 items-start">
            <div>
              <p style={{ fontFamily: BODY, fontSize: T.label, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: B.teal, marginBottom: 12 }}>
                Example run
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: T.h3, color: B.white, lineHeight: 1.25, marginBottom: 28 }}>
                {industry.scenarioTitle}
              </h2>
              <div className="space-y-0">
                {industry.scenario.map((step, i) => (
                  <div key={i} className="flex items-start gap-4" style={{ paddingBottom: i < industry.scenario.length - 1 ? 22 : 0 }}>
                    <div className="flex flex-col items-center" style={{ width: 16, flexShrink: 0 }}>
                      <div
                        style={{
                          width: 10, height: 10, borderRadius: '50%', marginTop: 5,
                          background: i === industry.scenario.length - 1 ? '#22C55E' : B.tealDark,
                          border: `2px solid ${i === industry.scenario.length - 1 ? '#16A34A' : B.tealMid}`,
                        }}
                      />
                      {i < industry.scenario.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 28, marginTop: 6, background: 'rgba(255,255,255,0.14)' }} />
                      )}
                    </div>
                    <div>
                      <span style={{ fontFamily: BODY, fontSize: T.label, fontWeight: 700, color: B.tealMid }}>{step.time}</span>
                      <p style={{ fontFamily: BODY, fontSize: T.body, color: 'rgba(255,255,255,0.72)', marginTop: 4, lineHeight: 1.55 }}>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: BODY, fontSize: T.label, fontWeight: 600, color: B.teal, marginTop: 28 }}>
                {industry.scenarioTag}
              </p>
            </div>

            <div>
              <p style={{ fontFamily: BODY, fontSize: T.label, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: B.teal, marginBottom: 12 }}>
                What you leave with
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: T.h3, color: B.white, lineHeight: 1.25, marginBottom: 28 }}>
                Outcomes that stick to the record
              </h2>
              <ul className="space-y-4">
                {industry.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-3">
                    <CheckCircle2 size={18} style={{ color: B.tealMid, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontFamily: BODY, fontSize: T.body, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: T.h3, color: B.gray100, letterSpacing: '-0.02em' }}>
            More industries
          </h2>
          <Link href="/industries" style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: B.tealDark, textDecoration: 'none' }}
            className="hover:opacity-80 inline-flex items-center gap-1.5">
            View all eight <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {others.map((o) => {
            const OIcon = o.icon;
            return (
              <Link
                key={o.slug}
                href={`/industries/${o.slug}`}
                className="group block rounded-xl border p-5 transition-all hover:shadow-md"
                style={{ borderColor: B.gray20, textDecoration: 'none', background: B.white }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: B.tealBg }}>
                  <OIcon size={18} style={{ color: B.tealDark }} />
                </div>
                <p style={{ fontFamily: BODY, fontWeight: 700, fontSize: 15, color: B.gray100, marginBottom: 6 }}>{o.title}</p>
                <p style={{ fontFamily: BODY, fontSize: 13, color: B.gray70, lineHeight: 1.5, margin: 0 }}>{o.accent}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section style={{ background: B.tealBg, borderTop: '1px solid #B0DDE8' }} className="py-20">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: T.h2, color: B.gray100, lineHeight: 1.2 }}>
            Ready to ship in {industry.title}?
          </h2>
          <p style={{ fontFamily: BODY, fontSize: T.body, color: B.gray70, marginTop: 16, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.75 }}>
            Free to start. Post a job with the requirements this industry actually needs — then track it live.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <Link href="/register"
              style={{ background: B.tealDark, fontFamily: BODY, fontSize: T.body, fontWeight: 700, color: B.white, padding: '16px 36px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              className="hover:opacity-90 transition-opacity">
              Get started free <ArrowRight size={16} />
            </Link>
            <Link href="/how-it-works"
              style={{ border: `2px solid ${B.tealDark}`, fontFamily: BODY, fontSize: T.body, fontWeight: 600, color: B.tealDark, padding: '14px 36px', borderRadius: 6, textDecoration: 'none' }}
              className="hover:bg-white transition-colors">
              See how it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
