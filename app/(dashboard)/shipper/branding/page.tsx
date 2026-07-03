'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Palette, Globe, FileText, Settings2, Mail,
  Save, ExternalLink, Info, Image as ImageIcon,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TenantBranding {
  id: number;
  brand_name: string | null;
  legal_name: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url_dark: string | null;
  favicon_url: string | null;
  hide_powered_by: boolean;
  subdomain: string | null;
  custom_domain: string | null;
  address: string | null;
  support_email: string | null;
  dot_number: string | null;
  fmcsa_broker_mc: string | null;
  broker_bond: string | null;
  terms_url: string | null;
  privacy_url: string | null;
  document_footer: string | null;
  signature_authority: string | null;
  billing_email: string | null;
  feature_flags: Record<string, boolean>;
  status: string;
  app_url: string;
  // Email
  mail_from_name: string | null;
  mail_from_address: string | null;
  mail_driver: string;
  mail_host: string | null;
  mail_port: number | null;
  mail_username: string | null;
  mail_password: string | null;
  mail_encryption: string | null;
  mail_api_key: string | null;
  mail_domain: string | null;
  mail_region: string | null;
}

type FormState = Omit<TenantBranding, 'id' | 'status' | 'app_url'>;

const EMPTY: FormState = {
  brand_name: '', legal_name: '',
  primary_color: '#0096C7', secondary_color: '#0A2E40',
  logo_url_dark: '', favicon_url: '',
  hide_powered_by: false,
  subdomain: '', custom_domain: '',
  address: '', support_email: '',
  dot_number: '', fmcsa_broker_mc: '', broker_bond: '',
  terms_url: '', privacy_url: '',
  document_footer: '', signature_authority: '',
  billing_email: '',
  feature_flags: {},
  mail_from_name: '', mail_from_address: '',
  mail_driver: 'default',
  mail_host: '', mail_port: null, mail_username: '',
  mail_password: '', mail_encryption: 'tls',
  mail_api_key: '', mail_domain: '', mail_region: '',
};

// ── Style helpers ─────────────────────────────────────────────────────────────

const LABEL = 'block text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5';
const INPUT = 'w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-teal)] focus:bg-[var(--color-white)] focus:outline-none transition-colors';
const TEXTAREA = INPUT + ' resize-none';
const CARD = 'rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]';
const SECTION = 'p-6 space-y-5';

// ── Sub-components ────────────────────────────────────────────────────────────

function ColorSwatch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="relative cursor-pointer">
        <div
          className="h-9 w-9 rounded-lg border-2 border-white shadow-md transition-transform hover:scale-110"
          style={{ background: value || '#cccccc' }}
        />
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer" />
      </label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder="#0096C7" maxLength={7}
        className="w-28 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-3 py-2 text-sm font-mono focus:border-[var(--color-teal)] focus:outline-none" />
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{sub}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-[var(--color-teal)]' : 'bg-gray-200'}`}
        role="switch" aria-checked={checked}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = 'brand' | 'domain' | 'legal' | 'email' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'brand',    label: 'Brand',    icon: Palette    },
  { id: 'domain',   label: 'Domain',   icon: Globe      },
  { id: 'legal',    label: 'Legal',    icon: FileText   },
  { id: 'email',    label: 'Email',    icon: Mail       },
  { id: 'settings', label: 'Settings', icon: Settings2  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BrandingPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('brand');
  const [form, setForm] = useState<FormState>(EMPTY);

  const { data: res, isLoading } = useQuery({
    queryKey: ['tenant-branding'],
    queryFn: () => api.get('/api/v1/tenant/branding'),
  });

  const tenant: TenantBranding | null = res?.data?.data ?? null;

  useEffect(() => {
    if (!tenant) return;
    setForm({
      brand_name:          tenant.brand_name          ?? '',
      legal_name:          tenant.legal_name          ?? '',
      primary_color:       tenant.primary_color       ?? '#0096C7',
      secondary_color:     tenant.secondary_color     ?? '#0A2E40',
      logo_url_dark:       tenant.logo_url_dark       ?? '',
      favicon_url:         tenant.favicon_url         ?? '',
      hide_powered_by:     tenant.hide_powered_by     ?? false,
      subdomain:           tenant.subdomain           ?? '',
      custom_domain:       tenant.custom_domain       ?? '',
      address:             tenant.address             ?? '',
      support_email:       tenant.support_email       ?? '',
      dot_number:          tenant.dot_number          ?? '',
      fmcsa_broker_mc:     tenant.fmcsa_broker_mc     ?? '',
      broker_bond:         tenant.broker_bond         ?? '',
      terms_url:           tenant.terms_url           ?? '',
      privacy_url:         tenant.privacy_url         ?? '',
      document_footer:     tenant.document_footer     ?? '',
      signature_authority: tenant.signature_authority ?? '',
      billing_email:       tenant.billing_email       ?? '',
      feature_flags:       tenant.feature_flags       ?? {},
      mail_from_name:      tenant.mail_from_name      ?? '',
      mail_from_address:   tenant.mail_from_address   ?? '',
      mail_driver:         tenant.mail_driver         ?? 'default',
      mail_host:           tenant.mail_host           ?? '',
      mail_port:           tenant.mail_port           ?? null,
      mail_username:       tenant.mail_username       ?? '',
      mail_password:       '',   // never pre-fill masked value
      mail_encryption:     tenant.mail_encryption     ?? 'tls',
      mail_api_key:        '',   // never pre-fill masked value
      mail_domain:         tenant.mail_domain         ?? '',
      mail_region:         tenant.mail_region         ?? '',
    });
  }, [tenant]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () => api.put('/api/v1/tenant/branding', form),
    onSuccess: () => {
      toast.success('Branding saved');
      qc.invalidateQueries({ queryKey: ['tenant-branding'] });
      if (form.primary_color)   document.documentElement.style.setProperty('--primary', form.primary_color);
      if (form.secondary_color) document.documentElement.style.setProperty('--navy',    form.secondary_color);
    },
    onError: () => toast.error('Failed to save'),
  });

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>;

  if (!tenant) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Palette size={32} className="mb-3 opacity-30" />
      <p className="text-sm text-[var(--color-text-muted)]">Not a white-label tenant. Contact Shipmater to upgrade.</p>
    </div>
  );

  const appHost = process.env.NEXT_PUBLIC_APP_HOST ?? 'app.shipmater.com';

  return (
    <div className="w-[75%] min-w-[560px] space-y-0">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
            White-Label Branding
          </h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
            Customise how your platform looks and operates.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tenant.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {tenant.status}
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] p-1 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              tab === id
                ? 'bg-[var(--color-white)] shadow-sm text-[var(--color-text)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Brand tab ─────────────────────────────────────────────────────── */}
      {tab === 'brand' && (
        <div className={CARD}>
          {/* Live preview strip */}
          <div
            className="flex items-center gap-3 rounded-t-2xl px-5 py-3.5"
            style={{ background: form.primary_color || 'var(--primary)' }}
          >
            {form.logo_url_dark
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={form.logo_url_dark} alt="logo" className="h-6 object-contain"
                  onError={e => (e.currentTarget.style.display = 'none')} />
              : <span className="font-bold tracking-widest text-white uppercase text-sm">
                  {form.brand_name || 'Your Brand'}
                </span>
            }
            <span className="ml-auto text-xs text-white/60">Live preview</span>
          </div>

          <div className={SECTION}>
            <div>
              <label className={LABEL}>Brand name</label>
              <input className={INPUT} value={form.brand_name} onChange={e => set('brand_name', e.target.value)}
                placeholder="e.g. FreightPro" />
              <p className="mt-1 text-xs text-[var(--color-text-faint)]">Replaces "Shipmater" everywhere in the UI.</p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={LABEL}>Primary colour</label>
                <ColorSwatch value={form.primary_color} onChange={v => set('primary_color', v)} />
                <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">Sidebar, buttons, links</p>
              </div>
              <div>
                <label className={LABEL}>Secondary colour</label>
                <ColorSwatch value={form.secondary_color} onChange={v => set('secondary_color', v)} />
                <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">Active nav, accents</p>
              </div>
            </div>

            <div>
              <label className={LABEL}>Logo URL <span className="normal-case font-normal">(for dark/navy background)</span></label>
              <div className="flex items-center gap-3">
                <ImageIcon size={16} className="shrink-0 text-[var(--color-text-faint)]" />
                <input className={INPUT} value={form.logo_url_dark} onChange={e => set('logo_url_dark', e.target.value)}
                  placeholder="https://cdn.yourcompany.com/logo-white.svg" />
              </div>
            </div>

            <div>
              <label className={LABEL}>Favicon URL <span className="normal-case font-normal">(.ico or 32×32 .png)</span></label>
              <div className="flex items-center gap-3">
                {form.favicon_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.favicon_url} alt="fav" className="h-7 w-7 rounded border border-[var(--color-cream-dark)] object-contain"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                )}
                <input className={INPUT} value={form.favicon_url} onChange={e => set('favicon_url', e.target.value)}
                  placeholder="https://cdn.yourcompany.com/favicon.ico" />
              </div>
            </div>

            <div className="pt-1 border-t border-[var(--color-cream-dark)]">
              <Toggle
                checked={form.hide_powered_by}
                onChange={v => set('hide_powered_by', v)}
                label={form.hide_powered_by ? '"Powered by Shipmater" hidden' : '"Powered by Shipmater" visible'}
                sub={form.hide_powered_by
                  ? 'Your customers see only your brand.'
                  : 'A small badge appears in the UI footer.'}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Domain tab ────────────────────────────────────────────────────── */}
      {tab === 'domain' && (
        <div className={CARD}>
          <div className={SECTION}>
            <div>
              <label className={LABEL}>Subdomain</label>
              <div className="flex items-center overflow-hidden rounded-xl border border-[var(--color-cream-dark)] focus-within:border-[var(--color-teal)] bg-[var(--color-cream)]">
                <input
                  className="flex-1 bg-transparent px-3.5 py-2.5 text-sm focus:outline-none"
                  value={form.subdomain}
                  onChange={e => set('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="freightpro"
                />
                <span className="shrink-0 border-l border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3 py-2.5 text-sm text-[var(--color-text-faint)]">
                  .shipmater.com
                </span>
              </div>
              {form.subdomain && (
                <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                  Your platform: <span className="font-mono">{form.subdomain}.shipmater.com</span>
                </p>
              )}
            </div>

            <div>
              <label className={LABEL}>Custom domain <span className="normal-case font-normal">(optional)</span></label>
              <input className={INPUT} value={form.custom_domain} onChange={e => set('custom_domain', e.target.value)}
                placeholder="freight.yourcompany.com" />

              {form.custom_domain && (
                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">DNS Setup Required</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="text-blue-600 text-left">
                          <th className="pr-4 pb-1">Type</th>
                          <th className="pr-4 pb-1">Name</th>
                          <th className="pb-1">Value</th>
                        </tr>
                      </thead>
                      <tbody className="text-blue-900">
                        <tr>
                          <td className="pr-4 py-0.5">CNAME</td>
                          <td className="pr-4 py-0.5">{form.custom_domain}</td>
                          <td className="py-0.5">{appHost}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-blue-600 flex items-start gap-1.5">
                    <Info size={12} className="mt-0.5 shrink-0" />
                    DNS changes can take up to 48 hours to propagate.
                  </p>
                </div>
              )}
            </div>

            {(form.subdomain || form.custom_domain) && (
              <a
                href={form.custom_domain ? `https://${form.custom_domain}` : `https://${form.subdomain}.shipmater.com`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--color-teal)] hover:underline"
              >
                <ExternalLink size={12} /> Open platform URL
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Legal tab ─────────────────────────────────────────────────────── */}
      {tab === 'legal' && (
        <div className={CARD}>
          <div className={SECTION}>
            <p className="text-xs text-[var(--color-text-faint)] rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
              These fields appear on generated documents (Rate Agreements, BOL, invoices). Ensure they match your legal entity exactly.
            </p>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={LABEL}>Legal entity name</label>
                <input className={INPUT} value={form.legal_name} onChange={e => set('legal_name', e.target.value)}
                  placeholder="FreightPro LLC" />
              </div>
              <div>
                <label className={LABEL}>Support email</label>
                <input className={INPUT} type="email" value={form.support_email} onChange={e => set('support_email', e.target.value)}
                  placeholder="support@yourcompany.com" />
              </div>
            </div>

            <div>
              <label className={LABEL}>Business address</label>
              <textarea className={TEXTAREA} rows={3} value={form.address} onChange={e => set('address', e.target.value)}
                placeholder={"123 Main St\nSuite 400\nChicago, IL 60601"} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={LABEL}>FMCSA Broker MC#</label>
                <input className={INPUT} value={form.fmcsa_broker_mc} onChange={e => set('fmcsa_broker_mc', e.target.value)}
                  placeholder="MC-123456" />
              </div>
              <div>
                <label className={LABEL}>DOT #</label>
                <input className={INPUT} value={form.dot_number} onChange={e => set('dot_number', e.target.value)}
                  placeholder="DOT-1234567" />
              </div>
              <div>
                <label className={LABEL}>Broker bond #</label>
                <input className={INPUT} value={form.broker_bond} onChange={e => set('broker_bond', e.target.value)}
                  placeholder="BMC-84 / surety #" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={LABEL}>Terms & Conditions URL</label>
                <input className={INPUT} type="url" value={form.terms_url} onChange={e => set('terms_url', e.target.value)}
                  placeholder="https://yourcompany.com/terms" />
              </div>
              <div>
                <label className={LABEL}>Privacy Policy URL</label>
                <input className={INPUT} type="url" value={form.privacy_url} onChange={e => set('privacy_url', e.target.value)}
                  placeholder="https://yourcompany.com/privacy" />
              </div>
            </div>

            <div>
              <label className={LABEL}>Document footer <span className="normal-case font-normal">(printed on every PDF)</span></label>
              <textarea className={TEXTAREA} rows={3} value={form.document_footer} onChange={e => set('document_footer', e.target.value)}
                placeholder="FreightPro LLC is a licensed freight broker (MC-123456). All shipments are subject to our Carrier Agreement and Rate Confirmation." />
            </div>

            <div>
              <label className={LABEL}>Signature authority line</label>
              <input className={INPUT} value={form.signature_authority} onChange={e => set('signature_authority', e.target.value)}
                placeholder="Authorised by Operations, FreightPro LLC" />
            </div>
          </div>
        </div>
      )}

      {/* ── Email tab ─────────────────────────────────────────────────────── */}
      {tab === 'email' && (
        <div className={CARD}>
          <div className={SECTION}>
            <p className="text-xs text-[var(--color-text-faint)] rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
              Set a custom sending identity so outbound emails (shipment confirmations, invitations, alerts) appear to come from your brand, not Shipmater.
            </p>

            {/* Always shown — sender identity */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={LABEL}>From name</label>
                <input className={INPUT} value={form.mail_from_name ?? ''} onChange={e => set('mail_from_name', e.target.value)}
                  placeholder="FreightPro Notifications" />
              </div>
              <div>
                <label className={LABEL}>From address</label>
                <input className={INPUT} type="email" value={form.mail_from_address ?? ''} onChange={e => set('mail_from_address', e.target.value)}
                  placeholder="noreply@freightpro.com" />
              </div>
            </div>

            {/* Driver selector */}
            <div>
              <label className={LABEL}>Sending driver</label>
              <select
                className={INPUT}
                value={form.mail_driver}
                onChange={e => set('mail_driver', e.target.value)}
              >
                <option value="default">Default (Shipmater&apos;s mailer — from-name/address overridden)</option>
                <option value="smtp">SMTP</option>
                <option value="postmark">Postmark</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="ses">Amazon SES</option>
              </select>
            </div>

            {/* SMTP fields */}
            {form.mail_driver === 'smtp' && (
              <div className="rounded-xl border border-[var(--color-cream-dark)] p-4 space-y-4">
                <p className={LABEL + ' mb-0'}>SMTP credentials</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className={LABEL}>Host</label>
                    <input className={INPUT} value={form.mail_host ?? ''} onChange={e => set('mail_host', e.target.value)}
                      placeholder="smtp.yourprovider.com" />
                  </div>
                  <div>
                    <label className={LABEL}>Port</label>
                    <input className={INPUT} type="number" value={form.mail_port ?? ''} onChange={e => set('mail_port', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="587" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Username</label>
                    <input className={INPUT} value={form.mail_username ?? ''} onChange={e => set('mail_username', e.target.value)}
                      autoComplete="off" placeholder="apikey or username" />
                  </div>
                  <div>
                    <label className={LABEL}>Password</label>
                    <input className={INPUT} type="password" value={form.mail_password ?? ''} onChange={e => set('mail_password', e.target.value)}
                      autoComplete="new-password" placeholder="Leave blank to keep existing" />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Encryption</label>
                  <select className={INPUT} value={form.mail_encryption ?? 'tls'} onChange={e => set('mail_encryption', e.target.value)}>
                    <option value="tls">TLS (recommended)</option>
                    <option value="ssl">SSL</option>
                    <option value="">None</option>
                  </select>
                </div>
              </div>
            )}

            {/* API key drivers */}
            {['postmark', 'sendgrid'].includes(form.mail_driver) && (
              <div className="rounded-xl border border-[var(--color-cream-dark)] p-4 space-y-4">
                <p className={LABEL + ' mb-0'}>{form.mail_driver === 'postmark' ? 'Postmark' : 'SendGrid'} API key</p>
                <input className={INPUT} type="password" value={form.mail_api_key ?? ''} onChange={e => set('mail_api_key', e.target.value)}
                  autoComplete="new-password" placeholder="Leave blank to keep existing" />
                <p className="text-xs text-[var(--color-text-faint)]">
                  {form.mail_driver === 'postmark'
                    ? 'Server API token from your Postmark dashboard.'
                    : 'Full-access API key from your SendGrid account.'}
                </p>
              </div>
            )}

            {/* Mailgun */}
            {form.mail_driver === 'mailgun' && (
              <div className="rounded-xl border border-[var(--color-cream-dark)] p-4 space-y-4">
                <p className={LABEL + ' mb-0'}>Mailgun credentials</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Domain</label>
                    <input className={INPUT} value={form.mail_domain ?? ''} onChange={e => set('mail_domain', e.target.value)}
                      placeholder="mg.freightpro.com" />
                  </div>
                  <div>
                    <label className={LABEL}>API key</label>
                    <input className={INPUT} type="password" value={form.mail_api_key ?? ''} onChange={e => set('mail_api_key', e.target.value)}
                      autoComplete="new-password" placeholder="Leave blank to keep existing" />
                  </div>
                </div>
              </div>
            )}

            {/* SES */}
            {form.mail_driver === 'ses' && (
              <div className="rounded-xl border border-[var(--color-cream-dark)] p-4 space-y-4">
                <p className={LABEL + ' mb-0'}>Amazon SES credentials</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Access key ID</label>
                    <input className={INPUT} value={form.mail_username ?? ''} onChange={e => set('mail_username', e.target.value)}
                      placeholder="AKIA…" />
                  </div>
                  <div>
                    <label className={LABEL}>Secret access key</label>
                    <input className={INPUT} type="password" value={form.mail_password ?? ''} onChange={e => set('mail_password', e.target.value)}
                      autoComplete="new-password" placeholder="Leave blank to keep existing" />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Region</label>
                  <input className={INPUT} value={form.mail_region ?? ''} onChange={e => set('mail_region', e.target.value)}
                    placeholder="us-east-1" />
                </div>
              </div>
            )}

            {form.mail_driver !== 'default' && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3">
                <Info size={13} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700">
                  Credentials are encrypted at rest. Passwords and API keys are never returned after saving — re-enter them only to change.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Settings tab ──────────────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className={CARD}>
          <div className={SECTION}>
            <div>
              <label className={LABEL}>Billing email</label>
              <input className={INPUT} type="email" value={form.billing_email} onChange={e => set('billing_email', e.target.value)}
                placeholder="billing@yourcompany.com" />
            </div>

            <div className="border-t border-[var(--color-cream-dark)] pt-5 space-y-4">
              <p className={LABEL}>Feature flags</p>
              {[
                { key: 'api_access',    label: 'API access',     sub: 'Allow direct API integration' },
                { key: 'custom_domain', label: 'Custom domain',  sub: 'Enable custom domain routing' },
                { key: 'sso',           label: 'SSO',            sub: 'SAML / OIDC single sign-on' },
              ].map(({ key, label, sub }) => (
                <Toggle
                  key={key}
                  checked={!!(form.feature_flags?.[key])}
                  onChange={v => set('feature_flags', { ...form.feature_flags, [key]: v })}
                  label={label}
                  sub={sub}
                />
              ))}
            </div>

            <div className="border-t border-[var(--color-cream-dark)] pt-5">
              <div className="flex items-center justify-between">
                <p className={LABEL + ' mb-0'}>Tenant status</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tenant.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {tenant.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-faint)]">Managed by Shipmater. Contact support to change.</p>
            </div>

            {tenant.app_url && (
              <div className="border-t border-[var(--color-cream-dark)] pt-5">
                <p className={LABEL}>Platform URL</p>
                <a href={tenant.app_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-teal)] hover:underline font-mono">
                  <ExternalLink size={12} /> {tenant.app_url}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'var(--primary)' }}
        >
          <Save size={15} />
          {save.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>

    </div>
  );
}
