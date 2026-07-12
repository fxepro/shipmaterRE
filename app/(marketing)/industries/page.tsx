'use client';

import Link from 'next/link';
import { useState, type ComponentType, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { INDUSTRIES } from '@/lib/marketing/industries';
import { T } from '@/lib/type-scale';

const B = {
  teal:     '#90E0EF',
  tealDark: '#0096C7',
  tealDeep: '#0077B6',
  tealNavy: '#023E8A',
  tealBg:   '#E0F7FA',
  gray100:  '#161616',
  gray70:   '#525252',
  gray50:   '#8D8D8D',
  gray20:   '#E0E0E0',
  white:    '#FFFFFF',
};
const BODY = 'var(--font-body)';
const DISPLAY = 'var(--font-display)';

function CardImage({
  src,
  alt,
  fallbackIcon: Icon,
}: {
  src: string;
  alt: string;
  fallbackIcon: ComponentType<{ size?: number; style?: CSSProperties }>;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ background: B.tealBg }}>
        <Icon size={28} style={{ color: B.tealDark }} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}

export default function IndustriesLandingPage() {
  return (
    <div style={{ fontFamily: BODY, background: B.white, WebkitFontSmoothing: 'antialiased' }}>
      <section style={{ background: `linear-gradient(145deg, ${B.tealNavy} 0%, ${B.tealDeep} 50%, ${B.tealDark} 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="relative mx-auto max-w-[1200px] px-6 pt-20 pb-20">
          <p style={{ fontFamily: BODY, fontSize: T.label, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: B.teal, marginBottom: 16 }}>
            Industries
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: T.hero, lineHeight: 1.1, letterSpacing: '-0.025em', color: B.white, maxWidth: 720 }}>
            Eight industries.<br />
            <span style={{ color: B.teal }}>One platform standard.</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: T.body, lineHeight: 1.75, color: 'rgba(255,255,255,0.75)', marginTop: 20, maxWidth: 560 }}>
            Different requirements, different stakes — the same vetting, tracking, and accountability on every load.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {INDUSTRIES.map(({ slug, icon: Icon, title, subtitle, image, imageAlt, accent }) => (
            <Link
              key={slug}
              href={`/industries/${slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border transition-all hover:shadow-md"
              style={{ borderColor: B.gray20, background: B.white, textDecoration: 'none' }}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden" style={{ background: B.tealBg }}>
                <CardImage src={image} alt={imageAlt} fallbackIcon={Icon} />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <p style={{ fontFamily: BODY, fontWeight: 700, fontSize: 16, color: B.gray100, lineHeight: 1.3, margin: 0 }}>
                  {title}
                </p>
                <p style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, color: B.tealDark, lineHeight: 1.4, margin: 0 }}>
                  {accent}
                </p>
                <p style={{ fontFamily: BODY, fontSize: 14, color: B.gray70, lineHeight: 1.55, margin: 0, flex: 1 }}>
                  {subtitle}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                  style={{ fontFamily: BODY, fontWeight: 600, fontSize: 13, color: B.tealDark }}
                >
                  Learn more <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: B.tealBg, borderTop: '1px solid #B0DDE8' }} className="py-20">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: T.h2, color: B.gray100, lineHeight: 1.2 }}>
            Your industry. Your requirements.<br />Our platform.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: T.body, color: B.gray70, marginTop: 16, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.75 }}>
            Free to start. Tell us what you need to move and we&apos;ll show you who can handle it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <Link href="/register"
              style={{ background: B.tealDark, fontFamily: BODY, fontSize: T.body, fontWeight: 700, color: B.white, padding: '16px 36px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              className="hover:opacity-90 transition-opacity">
              Get started free <ArrowRight size={16} />
            </Link>
            <Link href="/use-cases"
              style={{ border: `2px solid ${B.tealDark}`, fontFamily: BODY, fontSize: T.body, fontWeight: 600, color: B.tealDark, padding: '14px 36px', borderRadius: 6, textDecoration: 'none' }}
              className="hover:bg-white transition-colors">
              See use cases
            </Link>
          </div>
          <p style={{ fontFamily: BODY, fontSize: T.fine, color: B.gray50, marginTop: 20 }}>
            No setup fees · No long-term commitment
          </p>
        </div>
      </section>
    </div>
  );
}
