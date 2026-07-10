'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, type LucideIcon } from 'lucide-react';

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
};
const IBM = "'IBM Plex Sans', system-ui, sans-serif";
const T = {
  hero: 'clamp(34px, 5vw, 52px)' as string | number,
  h2:   'clamp(26px, 3.5vw, 34px)' as string | number,
  body: 16,
};

export interface MarketingSubPageProps {
  badge: string;
  icon?: LucideIcon;
  title: string;
  accent?: string;
  subtitle: string;
  points: string[];
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function MarketingSubPage({
  badge, icon: Icon, title, accent, subtitle, points, cta, secondaryCta,
}: MarketingSubPageProps) {
  return (
    <div style={{ fontFamily: IBM, background: B.white, color: B.darkCard }}>
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)`, padding: 'clamp(64px, 8vw, 112px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(144,224,239,0.12)', border: '1px solid rgba(144,224,239,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 24 }}>
            {Icon && <Icon size={14} color={B.teal} />}
            <span style={{ fontSize: 12, fontWeight: 600, color: B.teal, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{badge}</span>
          </div>
          <h1 style={{ fontSize: T.hero, fontWeight: 700, color: B.white, lineHeight: 1.15, margin: '0 0 20px' }}>
            {title}
            {accent && <><br /><span style={{ color: B.tealMid }}>{accent}</span></>}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 36px' }}>{subtitle}</p>
          {(cta || secondaryCta) && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {cta && (
                <Link href={cta.href}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: B.tealMid, color: B.tealNavy, fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}>
                  {cta.label} <ArrowRight size={16} />
                </Link>
              )}
              {secondaryCta && (
                <Link href={secondaryCta.href}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: B.white, fontWeight: 600, fontSize: 15, padding: '12px 28px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, textAlign: 'center', margin: '0 0 40px' }}>What you get</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {points.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: B.gray10, border: `1px solid ${B.gray20}`, borderRadius: 12, padding: '18px 22px' }}>
              <CheckCircle2 size={18} color={B.tealDeep} style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 15, color: B.gray70, lineHeight: 1.7, margin: 0 }}>{p}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
