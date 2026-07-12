'use client';

import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

const B = {
  tealDeep: '#0077B6',
  tealMid:  '#48CAE4',
  darkCard: '#0A1520',
  gray70:   '#525252',
  gray20:   '#E0E0E0',
  gray10:   '#F4F4F4',
  white:    '#FFFFFF',
};
const BODY = 'var(--font-body)';
const DISPLAY = 'var(--font-display)';

export interface HubPage {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  active?: boolean;
}

export function MarketingHub({ heading, pages }: { heading: string; pages: HubPage[] }) {
  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(40px, 5vw, 56px) 24px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: B.gray70, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 16px' }}>{heading}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {pages.map((p) => {
          const Icon = p.icon;
          const card = (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 14,
              padding: '22px 20px', borderRadius: 14, height: '100%',
              border: `1px solid ${p.active ? B.tealMid : B.gray20}`,
              background: p.active ? B.gray10 : B.white,
              cursor: p.active ? 'default' : 'pointer',
            }}
            className={p.active ? '' : 'hover:border-[#48CAE4] hover:shadow-md'}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: B.tealDeep + '18', border: `1.5px solid ${B.tealDeep}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={B.tealDeep} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: B.darkCard, margin: '0 0 6px' }}>{p.title}</p>
                <p style={{ fontSize: 14, color: B.gray70, lineHeight: 1.55, margin: 0 }}>{p.desc}</p>
              </div>
              {!p.active && (
                <span style={{ fontSize: 13, fontWeight: 600, color: B.tealDeep, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
                  Learn more <ArrowRight size={14} />
                </span>
              )}
            </div>
          );
          return p.active
            ? <div key={p.href}>{card}</div>
            : <Link key={p.href} href={p.href} style={{ textDecoration: 'none', display: 'block' }}>{card}</Link>;
        })}
      </div>
    </section>
  );
}
