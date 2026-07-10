'use client';

import Link from 'next/link';
import { CheckCircle2, XCircle, MinusCircle, ArrowRight, Globe } from 'lucide-react';

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
  amber:    '#D97706',
};
const IBM = "'IBM Plex Sans', system-ui, sans-serif";
const T = {
  hero: 'clamp(34px, 5vw, 52px)' as string | number,
  h2:   'clamp(26px, 3.5vw, 34px)' as string | number,
  h3:   20,
  body: 16,
};

type Coverage = 'full' | 'partial' | 'none';

interface CountryRow {
  flag:         string;
  country:      string;
  region:       string;
  gps:          Coverage;
  identity:     Coverage;
  bgCheck:      Coverage;
  payout:       Coverage;
  documents:    Coverage;
  notes?:       string;
}

const DATA: CountryRow[] = [
  { flag:'🇺🇸', country:'United States',   region:'USMCA',    gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full', notes:'Full FMCSA, FMCSA Clearinghouse' },
  { flag:'🇨🇦', country:'Canada',           region:'USMCA',    gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full', notes:'NSC authority, provincial CDL' },
  { flag:'🇲🇽', country:'Mexico',           region:'USMCA',    gps:'full', identity:'full', bgCheck:'partial', payout:'full', documents:'full', notes:'Permiso SCT; adverse media screening' },
  { flag:'🇬🇧', country:'United Kingdom',   region:'Europe',   gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full', notes:'Community Licence' },
  { flag:'🇩🇪', country:'Germany',          region:'Europe',   gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full' },
  { flag:'🇫🇷', country:'France',           region:'Europe',   gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full' },
  { flag:'🇳🇱', country:'Netherlands',      region:'Europe',   gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full' },
  { flag:'🇪🇸', country:'Spain',            region:'Europe',   gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full' },
  { flag:'🇮🇹', country:'Italy',            region:'Europe',   gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full' },
  { flag:'🇵🇱', country:'Poland',           region:'Europe',   gps:'full', identity:'full', bgCheck:'partial', payout:'full', documents:'full' },
  { flag:'🇦🇺', country:'Australia',        region:'APAC',     gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full' },
  { flag:'🇳🇿', country:'New Zealand',      region:'APAC',     gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full' },
  { flag:'🇸🇬', country:'Singapore',        region:'APAC',     gps:'full', identity:'full', bgCheck:'full', payout:'full', documents:'full' },
  { flag:'🇯🇵', country:'Japan',            region:'APAC',     gps:'full', identity:'partial', bgCheck:'partial', payout:'full', documents:'full' },
  { flag:'🇮🇳', country:'India',            region:'APAC',     gps:'full', identity:'partial', bgCheck:'partial', payout:'full', documents:'full', notes:'National ID accepted' },
  { flag:'🇧🇷', country:'Brazil',           region:'LATAM',    gps:'full', identity:'partial', bgCheck:'partial', payout:'full', documents:'full' },
  { flag:'🇦🇷', country:'Argentina',        region:'LATAM',    gps:'full', identity:'partial', bgCheck:'partial', payout:'partial', documents:'full' },
  { flag:'🇨🇴', country:'Colombia',         region:'LATAM',    gps:'full', identity:'partial', bgCheck:'partial', payout:'partial', documents:'full' },
  { flag:'🇿🇦', country:'South Africa',     region:'MENA/AF',  gps:'full', identity:'partial', bgCheck:'partial', payout:'partial', documents:'full' },
  { flag:'🇦🇪', country:'UAE',              region:'MENA/AF',  gps:'full', identity:'partial', bgCheck:'partial', payout:'partial', documents:'full' },
];

function Tick({ val }: { val: Coverage }) {
  if (val === 'full')    return <CheckCircle2 size={16} color={B.tealDeep} style={{ display:'inline' }} />;
  if (val === 'partial') return <MinusCircle  size={16} color={B.amber} style={{ display:'inline' }} />;
  return                        <XCircle      size={16} color={B.gray20} style={{ display:'inline' }} />;
}

const LEGEND = [
  { icon: <CheckCircle2 size={14} color={B.tealDeep} style={{ display:'inline' }} />, label: 'Full support' },
  { icon: <MinusCircle  size={14} color={B.amber} style={{ display:'inline' }} />, label: 'Partial / adverse-media only' },
  { icon: <XCircle      size={14} color={B.gray20} style={{ display:'inline' }} />, label: 'Not available' },
];

const REGIONS = ['USMCA','Europe','APAC','LATAM','MENA/AF'];

export default function CoveragePage() {
  return (
    <div style={{ fontFamily: IBM, background: B.white, color: B.darkCard }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${B.tealNavy} 0%, ${B.darkSec} 100%)`, padding: 'clamp(64px, 8vw, 112px) 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(144,224,239,0.12)', border: '1px solid rgba(144,224,239,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 24 }}>
            <Globe size={14} color={B.teal} />
            <span style={{ fontSize: 12, fontWeight: 600, color: B.teal, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Country Coverage
            </span>
          </div>
          <h1 style={{ fontSize: T.hero, fontWeight: 700, color: B.white, lineHeight: 1.15, margin: '0 0 20px' }}>
            What Works — Where
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            GPS tracking, identity verification, background screening, and payouts — see exactly what features are available in each country.
          </p>
        </div>
      </section>

      {/* Legend */}
      <section style={{ background: B.tealNavy, borderBottom: `1px solid rgba(144,224,239,0.15)` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {LEGEND.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {l.icon}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Table */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        {REGIONS.map(region => {
          const rows = DATA.filter(d => d.region === region);
          return (
            <div key={region} style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: T.h3, fontWeight: 700, color: B.darkCard, margin: '0 0 16px', paddingLeft: 4 }}>{region}</h2>
              <div style={{ border: `1px solid ${B.gray20}`, borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: B.gray10 }}>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: B.gray70, textTransform: 'uppercase', letterSpacing: '0.07em', width: '22%' }}>Country</th>
                      <th style={{ padding: '14px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: B.gray70, textTransform: 'uppercase', letterSpacing: '0.06em' }}>GPS</th>
                      <th style={{ padding: '14px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: B.gray70, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Identity</th>
                      <th style={{ padding: '14px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: B.gray70, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bg Check</th>
                      <th style={{ padding: '14px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: B.gray70, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payout</th>
                      <th style={{ padding: '14px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: B.gray70, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Docs</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: B.gray70, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${B.gray20}`, background: i % 2 === 0 ? B.white : B.gray10 }}>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 18, marginRight: 8 }}>{row.flag}</span>
                          <span style={{ fontSize: 15, fontWeight: 600, color: B.darkCard }}>{row.country}</span>
                        </td>
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}><Tick val={row.gps} /></td>
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}><Tick val={row.identity} /></td>
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}><Tick val={row.bgCheck} /></td>
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}><Tick val={row.payout} /></td>
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}><Tick val={row.documents} /></td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: B.gray70 }}>{row.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        <div style={{
          background: '#FFF8E7', border: `1px solid ${B.amber}`, borderRadius: 12,
          padding: '18px 22px', display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</span>
          <p style={{ fontSize: 14, color: '#92400E', lineHeight: 1.7, margin: 0 }}>
            <strong>Background checks:</strong> "Partial" indicates automated adverse-media and sanctions screening. Full criminal + driving record checks require the carrier's local identifier. Coverage is continuously expanding — contact us for the latest status on your country.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: B.gray10, padding: 'clamp(48px, 6vw, 80px) 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: T.h2, fontWeight: 700, color: B.darkCard, margin: '0 0 12px' }}>
          Don't see your country?
        </h2>
        <p style={{ fontSize: T.body, color: B.gray70, margin: '0 auto 28px', maxWidth: 440, lineHeight: 1.7 }}>
          We're expanding continuously. Get in touch and we'll tell you exactly what's available.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/register"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: B.tealDeep, color: B.white, fontWeight: 700, fontSize: 15, padding: '13px 30px', borderRadius: 10, textDecoration: 'none' }}>
            Register anyway <ArrowRight size={16} />
          </Link>
          <Link href="/usmca"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: B.white, color: B.darkCard, fontWeight: 600, fontSize: 15, padding: '13px 30px', borderRadius: 10, border: `1px solid ${B.gray20}`, textDecoration: 'none' }}>
            USMCA details
          </Link>
        </div>
      </section>

    </div>
  );
}
