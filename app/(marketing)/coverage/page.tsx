import Link from 'next/link';
import { CheckCircle2, XCircle, MinusCircle, ArrowRight, Globe } from 'lucide-react';

const B = { navy:'#0A2E40', teal:'#0096C7', tealLt:'#90E0EF', cream:'#F0F4F7', white:'#FFFFFF', text:'#1A2B3C', muted:'#64748B', border:'#E2ECF0' };
const FONT = "'Roboto','IBM Plex Sans',system-ui,sans-serif";

type Coverage = 'full' | 'partial' | 'none';

interface CountryRow {
  flag:         string;
  country:      string;
  region:       string;
  gps:          Coverage;
  stripeId:     Coverage;
  bgCheck:      Coverage;
  stripePayout: Coverage;
  documents:    Coverage;
  notes?:       string;
}

const DATA: CountryRow[] = [
  // USMCA
  { flag:'🇺🇸', country:'United States',   region:'USMCA',    gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full',    notes:'Full FMCSA, FMCSA Clearinghouse' },
  { flag:'🇨🇦', country:'Canada',           region:'USMCA',    gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full',    notes:'NSC authority, provincial CDL' },
  { flag:'🇲🇽', country:'Mexico',           region:'USMCA',    gps:'full',    stripeId:'full',    bgCheck:'partial', stripePayout:'full',    documents:'full',    notes:'Permiso SCT; Checkr adverse media' },
  // EU / UK / Europe
  { flag:'🇬🇧', country:'United Kingdom',   region:'Europe',   gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full',    notes:'Community Licence' },
  { flag:'🇩🇪', country:'Germany',          region:'Europe',   gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full'    },
  { flag:'🇫🇷', country:'France',           region:'Europe',   gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full'    },
  { flag:'🇳🇱', country:'Netherlands',      region:'Europe',   gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full'    },
  { flag:'🇪🇸', country:'Spain',            region:'Europe',   gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full'    },
  { flag:'🇮🇹', country:'Italy',            region:'Europe',   gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full'    },
  { flag:'🇵🇱', country:'Poland',           region:'Europe',   gps:'full',    stripeId:'full',    bgCheck:'partial', stripePayout:'full',    documents:'full'    },
  // APAC
  { flag:'🇦🇺', country:'Australia',        region:'APAC',     gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full'    },
  { flag:'🇳🇿', country:'New Zealand',      region:'APAC',     gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full'    },
  { flag:'🇸🇬', country:'Singapore',        region:'APAC',     gps:'full',    stripeId:'full',    bgCheck:'full',    stripePayout:'full',    documents:'full'    },
  { flag:'🇯🇵', country:'Japan',            region:'APAC',     gps:'full',    stripeId:'partial', bgCheck:'partial', stripePayout:'full',    documents:'full'    },
  { flag:'🇮🇳', country:'India',            region:'APAC',     gps:'full',    stripeId:'partial', bgCheck:'partial', stripePayout:'full',    documents:'full',    notes:'Aadhar ID' },
  // LATAM
  { flag:'🇧🇷', country:'Brazil',           region:'LATAM',    gps:'full',    stripeId:'partial', bgCheck:'partial', stripePayout:'full',    documents:'full'    },
  { flag:'🇦🇷', country:'Argentina',        region:'LATAM',    gps:'full',    stripeId:'partial', bgCheck:'partial', stripePayout:'partial', documents:'full'    },
  { flag:'🇨🇴', country:'Colombia',         region:'LATAM',    gps:'full',    stripeId:'partial', bgCheck:'partial', stripePayout:'partial', documents:'full'    },
  // MENA / Africa
  { flag:'🇿🇦', country:'South Africa',     region:'MENA/AF',  gps:'full',    stripeId:'partial', bgCheck:'partial', stripePayout:'partial', documents:'full'    },
  { flag:'🇦🇪', country:'UAE',              region:'MENA/AF',  gps:'full',    stripeId:'partial', bgCheck:'partial', stripePayout:'partial', documents:'full'    },
];

function Tick({ val }: { val: Coverage }) {
  if (val === 'full')    return <CheckCircle2 size={16} color="#0096C7" style={{ display:'inline' }} />;
  if (val === 'partial') return <MinusCircle  size={16} color="#F59E0B" style={{ display:'inline' }} />;
  return                        <XCircle      size={16} color="#CBD5E1" style={{ display:'inline' }} />;
}

const LEGEND = [
  { icon: <CheckCircle2 size={14} color="#0096C7" style={{ display:'inline' }} />, label: 'Full support' },
  { icon: <MinusCircle  size={14} color="#F59E0B" style={{ display:'inline' }} />, label: 'Partial / automated adverse-media only' },
  { icon: <XCircle      size={14} color="#CBD5E1" style={{ display:'inline' }} />, label: 'Not available' },
];

const REGIONS = ['USMCA','Europe','APAC','LATAM','MENA/AF'];

export default function CoveragePage() {
  return (
    <div style={{ fontFamily: FONT }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${B.navy} 0%, #0D3B53 100%)`,
        padding: '80px 24px 64px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,150,199,0.18)', border: '1px solid rgba(0,150,199,0.35)',
            borderRadius: 20, padding: '6px 14px', marginBottom: 24,
          }}>
            <Globe size={14} color={B.tealLt} />
            <span style={{ fontSize: 12, fontWeight: 600, color: B.tealLt, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Country Coverage
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px,5vw,50px)', fontWeight: 800, color: B.white, lineHeight: 1.1, marginBottom: 16 }}>
            What Works — Where
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>
            GPS tracking, identity verification, background checks, Stripe payouts — see exactly what features are available in each country.
          </p>
        </div>
      </section>

      {/* ── Legend ───────────────────────────────────────────────────── */}
      <section style={{ background: B.teal, padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {LEGEND.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {l.icon}
              <span style={{ fontSize: 13, color: B.white, fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <section style={{ padding: '56px 24px 80px', background: B.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {REGIONS.map(region => {
            const rows = DATA.filter(d => d.region === region);
            return (
              <div key={region} style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: B.text, marginBottom: 16, paddingLeft: 4 }}>{region}</h2>
                <div style={{ border: `1px solid ${B.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: B.cream }}>
                        <th style={{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: '0.07em', width: '22%' }}>Country</th>
                        <th style={{ padding: '11px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>GPS</th>
                        <th style={{ padding: '11px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stripe ID</th>
                        <th style={{ padding: '11px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bg Check</th>
                        <th style={{ padding: '11px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payout</th>
                        <th style={{ padding: '11px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Docs</th>
                        <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: B.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} style={{ borderTop: `1px solid ${B.border}`, background: i % 2 === 0 ? B.white : B.cream }}>
                          <td style={{ padding: '12px 20px' }}>
                            <span style={{ fontSize: 18, marginRight: 8 }}>{row.flag}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: B.text }}>{row.country}</span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}><Tick val={row.gps} /></td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}><Tick val={row.stripeId} /></td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}><Tick val={row.bgCheck} /></td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}><Tick val={row.stripePayout} /></td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}><Tick val={row.documents} /></td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: B.muted }}>{row.notes ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* disclaimer */}
          <div style={{
            background: '#FFF8E7', border: '1px solid #F59E0B', borderRadius: 10,
            padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 18 }}>ℹ️</span>
            <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.6 }}>
              <strong>Background checks:</strong> "Partial" indicates automated adverse-media and sanctions screening via Checkr. Full criminal + driving record checks require the carrier's local identifier (SSN equivalent). Coverage is continuously expanding — contact us for the latest status on your country.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section style={{ background: B.cream, padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: B.text, marginBottom: 12 }}>
          Don't see your country?
        </h2>
        <p style={{ fontSize: 15, color: B.muted, marginBottom: 28 }}>
          We're expanding continuously. Get in touch and we'll tell you exactly what's available.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/register" style={{
            background: B.teal, color: B.white, fontWeight: 600, fontSize: 15,
            padding: '12px 28px', borderRadius: 7, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Register anyway <ArrowRight size={15} />
          </Link>
          <Link href="/usmca" style={{
            background: B.white, color: B.text, fontWeight: 600, fontSize: 15,
            padding: '12px 28px', borderRadius: 7, textDecoration: 'none', border: `1px solid ${B.border}`,
          }}>
            USMCA details
          </Link>
        </div>
      </section>

    </div>
  );
}
