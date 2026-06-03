'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi, profileApi } from '@/lib/api';
import {
  User, Building2, CreditCard, Bell, Zap,
  Camera, Check, ChevronDown, Plus, Trash2,
  Mail, Phone, MapPin, Globe, Hash, Shield,
  AlertCircle, Landmark, X, Loader2, Star,
  CalendarDays, RefreshCw, ChevronRight,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'business' | 'payment' | 'subscription' | 'notifications';

interface ShipperProfile {
  name: string; email: string; phone: string;
  street: string; city: string; state: string; zip: string; country: string;
  company: string; business_type: string; ein: string; industry: string; website: string;
  biz_street: string; biz_city: string; biz_state: string; biz_zip: string;
  notif_email: Record<string, boolean>;
  notif_sms:   Record<string, boolean>;
  member_since: string;
}

interface PaymentMethod {
  id: number; type: 'card' | 'bank';
  brand: string | null; last4: string;
  exp_month: string | null; exp_year: string | null;
  bank_name: string | null; account_type: 'checking' | 'savings' | null;
  is_default: boolean;
}

interface NewCardPayload { type: 'card'; brand: string; last4: string; exp_month: string; exp_year: string; }
interface NewBankPayload { type: 'bank'; bank_name: string; last4: string; account_type: 'checking' | 'savings'; }

// ── Helpers ───────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
      {children}
    </p>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, icon: Icon, readOnly,
}: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; icon?: React.ElementType; readOnly?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]">
            <Icon size={14} />
          </div>
        )}
        <input
          type={type} value={value} readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] transition-colors
            placeholder:text-[var(--color-text-faint)]
            focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20
            ${Icon ? 'pl-9' : ''}
            ${readOnly ? 'bg-[var(--color-cream)] cursor-default text-[var(--color-text-muted)]' : ''}
          `}
        />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20">
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--color-cream-dark)] last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        {sub && <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{sub}</p>}
      </div>
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none ${
          checked ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-cream-dark)]'
        }`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}

function SaveBar({ saved, onSave, isPending }: { saved: boolean; onSave: () => void; isPending?: boolean }) {
  return (
    <div className="flex items-center justify-end pt-4 border-t border-[var(--color-cream-dark)]">
      <button onClick={onSave} disabled={isPending}
        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-60 ${
          saved
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm'
        }`}>
        {isPending
          ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
          : saved
          ? <><Check size={15} /> Saved</>
          : 'Save changes'}
      </button>
    </div>
  );
}

// ── Tab: Profile ──────────────────────────────────────────────────────────────

function ProfileTab({ initialData }: { initialData: ShipperProfile }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name:    initialData.name,
    email:   initialData.email,
    phone:   initialData.phone,
    street:  initialData.street,
    city:    initialData.city,
    state:   initialData.state,
    zip:     initialData.zip,
    country: initialData.country,
  });
  const [saved, setSaved] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const saveMutation = useMutation({
    mutationFn: () => profileApi.updateShipper(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipper-profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const initials = form.name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-[var(--color-slate)] flex items-center justify-center text-2xl font-bold text-white select-none">
            {initials}
          </div>
          <button className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-teal)] text-white shadow-md hover:bg-[var(--color-teal-dark)] transition-colors">
            <Camera size={13} />
          </button>
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--color-text)]">{form.name}</p>
          <p className="text-sm text-[var(--color-text-faint)]">Shipper account</p>
          <p className="mt-1 text-xs text-[var(--color-text-faint)]">Member since {initialData.member_since}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User size={14} className="text-[var(--color-teal)]" />
          <p className="text-sm font-semibold text-[var(--color-text)]">Personal information</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name"     value={form.name}  onChange={set('name')}  icon={User} placeholder="Your full name" />
          <Field label="Email address" value={form.email} onChange={set('email')} icon={Mail} type="email" placeholder="you@example.com" />
        </div>
        <Field label="Phone number" value={form.phone} onChange={set('phone')} icon={Phone} type="tel" placeholder="+1 (555) 000-0000" />
      </div>

      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={14} className="text-[var(--color-teal)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Default ship-from address</p>
            <p className="text-xs text-[var(--color-text-faint)]">Pre-filled as pickup on new shipments</p>
          </div>
        </div>
        <Field label="Street address" value={form.street}  onChange={set('street')}  placeholder="123 Warehouse Blvd" />
        <div className="grid grid-cols-3 gap-4">
          <Field label="City"  value={form.city}  onChange={set('city')}  placeholder="Denver" />
          <Field label="State" value={form.state} onChange={set('state')} placeholder="CO" />
          <Field label="ZIP"   value={form.zip}   onChange={set('zip')}   placeholder="80216" />
        </div>
        <Field label="Country" value={form.country} onChange={set('country')} icon={Globe} placeholder="United States" />
      </div>

      <SaveBar saved={saved} onSave={() => saveMutation.mutate()} isPending={saveMutation.isPending} />
    </div>
  );
}

// ── Tab: Business ─────────────────────────────────────────────────────────────

function BusinessTab({ initialData }: { initialData: ShipperProfile }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    company:      initialData.company,
    business_type: initialData.business_type,
    ein:          initialData.ein,
    industry:     initialData.industry,
    website:      initialData.website,
    biz_street:   initialData.biz_street,
    biz_city:     initialData.biz_city,
    biz_state:    initialData.biz_state,
    biz_zip:      initialData.biz_zip,
  });
  const [saved, setSaved] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const saveMutation = useMutation({
    mutationFn: () => profileApi.updateShipper(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipper-profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={14} className="text-[var(--color-teal)]" />
          <p className="text-sm font-semibold text-[var(--color-text)]">Company identity</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company name" value={form.company} onChange={set('company')} icon={Building2} placeholder="Acme Corp" />
          <Select label="Business type" value={form.business_type} onChange={set('business_type')} options={[
            'Sole Proprietor', 'Limited Liability Company (LLC)', 'S-Corporation',
            'C-Corporation', 'Partnership', 'Non-Profit',
          ]} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="EIN / Tax ID" value={form.ein} onChange={set('ein')} icon={Hash} placeholder="XX-XXXXXXX" />
          <Select label="Industry" value={form.industry} onChange={set('industry')} options={[
            'Manufacturing', 'Retail / E-Commerce', 'Healthcare / Pharma', 'Automotive',
            'Food & Beverage', 'Construction', 'Technology', 'Entertainment', 'Other',
          ]} />
        </div>
        <Field label="Website" value={form.website} onChange={set('website')} icon={Globe} type="url" placeholder="https://yourcompany.com" />
      </div>

      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={14} className="text-[var(--color-teal)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Business address</p>
            <p className="text-xs text-[var(--color-text-faint)]">Registered address for billing and compliance</p>
          </div>
        </div>
        <Field label="Street" value={form.biz_street} onChange={set('biz_street')} placeholder="123 Commerce St" />
        <div className="grid grid-cols-3 gap-4">
          <Field label="City"  value={form.biz_city}  onChange={set('biz_city')}  placeholder="Denver" />
          <Field label="State" value={form.biz_state} onChange={set('biz_state')} placeholder="CO" />
          <Field label="ZIP"   value={form.biz_zip}   onChange={set('biz_zip')}   placeholder="80216" />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} className="text-[var(--color-teal)]" />
          <p className="text-sm font-semibold text-[var(--color-text)]">Verification status</p>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Email address',  status: 'verified'    },
            { label: 'Phone number',   status: 'pending'     },
            { label: 'Business (EIN)', status: 'not_started' },
          ].map(({ label, status }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text)]">{label}</span>
              {status === 'verified'    && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"><Check size={11} /> Verified</span>}
              {status === 'pending'     && <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700"><AlertCircle size={11} /> Pending</span>}
              {status === 'not_started' && <button className="text-xs font-semibold text-[var(--color-teal)] hover:underline">Verify now →</button>}
            </div>
          ))}
        </div>
      </div>

      <SaveBar saved={saved} onSave={() => saveMutation.mutate()} isPending={saveMutation.isPending} />
    </div>
  );
}

// ── Tab: Payment ──────────────────────────────────────────────────────────────

const BRAND_COLORS: Record<string, string> = { Visa: '#1A1F71', Mastercard: '#EB001B' };

function AddCardModal({ onClose, onAdd, isPending }: { onClose: () => void; onAdd: (p: NewCardPayload) => void; isPending: boolean }) {
  const [num, setNum] = useState(''); const [name, setName] = useState('');
  const [exp, setExp] = useState(''); const [cvv, setCvv]   = useState('');
  const formatCardNum = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 16); return d.replace(/(.{4})(?=.)/g, '$1 '); };
  const formatExp = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d; };
  const rawNum = num.replace(/\s/g, '');
  const brand  = rawNum.startsWith('4') ? 'Visa' : rawNum.startsWith('5') ? 'Mastercard' : 'Card';
  const valid  = rawNum.length === 16 && name.trim().length > 1 && exp.length === 7 && cvv.length >= 3;
  const handleAdd = () => { if (!valid || isPending) return; const [em, ey] = exp.replace(/\s/g, '').split('/'); onAdd({ type: 'card', brand, last4: rawNum.slice(-4), exp_month: em, exp_year: ey }); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-white)] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-[var(--color-text)]">Add credit / debit card</h3>
          <button onClick={onClose} disabled={isPending} className="text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors"><X size={18} /></button>
        </div>
        <div className="mb-5 rounded-xl bg-gradient-to-br from-[var(--color-slate)] to-[#1e3a5f] p-4 text-white select-none">
          <p className="font-mono text-lg tracking-widest">{num || '•••• •••• •••• ••••'}</p>
          <div className="mt-3 flex items-end justify-between text-xs">
            <div><p className="mb-0.5 opacity-50 uppercase tracking-wider text-xs">Cardholder</p><p className="font-medium">{name || 'Your name'}</p></div>
            <div className="text-right"><p className="mb-0.5 opacity-50 uppercase tracking-wider text-xs">Expires</p><p className="font-medium">{exp || 'MM / YY'}</p></div>
          </div>
        </div>
        <div className="space-y-4">
          <div><Label>Card number</Label><input value={num} onChange={(e) => setNum(formatCardNum(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm font-mono tracking-wider focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20" /></div>
          <div><Label>Cardholder name</Label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Expiry</Label><input value={exp} onChange={(e) => setExp(formatExp(e.target.value))} placeholder="MM / YY" maxLength={7} className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm font-mono focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20" /></div>
            <div><Label>CVV</Label><input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" maxLength={4} type="password" className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm font-mono focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20" /></div>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} disabled={isPending} className="flex-1 rounded-xl border border-[var(--color-cream-dark)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleAdd} disabled={!valid || isPending} className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${valid && !isPending ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm' : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'}`}>
            {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save card'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddBankModal({ onClose, onAdd, isPending }: { onClose: () => void; onAdd: (p: NewBankPayload) => void; isPending: boolean }) {
  const [holder, setHolder]   = useState(''); const [routing, setRouting] = useState('');
  const [account, setAccount] = useState(''); const [confirm, setConfirm] = useState('');
  const [type, setType] = useState<'Checking' | 'Savings'>('Checking');
  const numMatch = account.length > 0 && confirm.length > 0 && account === confirm;
  const numMismatch = confirm.length > 0 && account !== confirm;
  const valid = holder.trim().length > 1 && routing.length === 9 && account.length >= 4 && numMatch;
  const handleAdd = () => { if (!valid || isPending) return; onAdd({ type: 'bank', bank_name: 'Bank Account', last4: account.slice(-4), account_type: type.toLowerCase() as 'checking' | 'savings' }); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-white)] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-[var(--color-text)]">Add bank account (ACH)</h3>
          <button onClick={onClose} disabled={isPending} className="text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div><Label>Account holder name</Label><input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Alex Morgan" className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20" /></div>
          <div><Label>Account type</Label>
            <div className="flex gap-2">
              {(['Checking', 'Savings'] as const).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all ${type === t ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)] text-[var(--color-teal)]' : 'border-[var(--color-cream-dark)] text-[var(--color-text-muted)] hover:border-[var(--color-teal)]'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div><Label>Routing number</Label><input value={routing} onChange={(e) => setRouting(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="9-digit ABA routing number" maxLength={9} className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm font-mono focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20" />{routing.length > 0 && routing.length < 9 && <p className="mt-1 text-xs text-amber-600">{9 - routing.length} more digit{9 - routing.length !== 1 ? 's' : ''} needed</p>}</div>
          <div><Label>Account number</Label><input value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, '').slice(0, 17))} placeholder="Account number" maxLength={17} className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm font-mono focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20" /></div>
          <div><Label>Confirm account number</Label><input value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 17))} placeholder="Re-enter account number" maxLength={17} className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 bg-[var(--color-white)] ${numMismatch ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : numMatch ? 'border-emerald-400 focus:border-emerald-400 focus:ring-emerald-400/20' : 'border-[var(--color-cream-dark)] focus:border-[var(--color-teal)] focus:ring-[var(--color-teal)]/20'}`} />{numMismatch && <p className="mt-1 text-xs text-red-500">Account numbers don&apos;t match</p>}{numMatch && <p className="mt-1 text-xs text-emerald-600">✓ Numbers match</p>}</div>
        </div>
        <div className="mt-4 rounded-xl bg-[var(--color-cream)] px-3.5 py-3 text-xs text-[var(--color-text-faint)]">🔒 Your bank details are encrypted end-to-end. ACH payments are processed via Stripe.</div>
        <div className="mt-4 flex gap-3">
          <button onClick={onClose} disabled={isPending} className="flex-1 rounded-xl border border-[var(--color-cream-dark)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleAdd} disabled={!valid || isPending} className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${valid && !isPending ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm' : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'}`}>
            {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save bank account'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentTab() {
  const queryClient = useQueryClient();
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const { data: methods = [], isLoading } = useQuery<PaymentMethod[]>({ queryKey: ['payment-methods'], queryFn: () => paymentApi.list().then((r) => r.data.data) });
  const cards = methods.filter((m) => m.type === 'card');
  const banks = methods.filter((m) => m.type === 'bank');
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
  const addMutation     = useMutation({ mutationFn: (p: NewCardPayload | NewBankPayload) => paymentApi.create(p as unknown as Record<string, unknown>) });
  const deleteMutation  = useMutation({ mutationFn: (id: number) => paymentApi.destroy(id), onSuccess: invalidate });
  const defaultMutation = useMutation({ mutationFn: (id: number) => paymentApi.setDefault(id), onSuccess: invalidate });
  const handleAddCard = (p: NewCardPayload) => addMutation.mutate(p, { onSuccess: () => { invalidate(); setShowAddCard(false); } });
  const handleAddBank = (p: NewBankPayload) => addMutation.mutate(p, { onSuccess: () => { invalidate(); setShowAddBank(false); } });
  return (
    <>
      {showAddCard && <AddCardModal onClose={() => setShowAddCard(false)} onAdd={handleAddCard} isPending={addMutation.isPending} />}
      {showAddBank && <AddBankModal onClose={() => setShowAddBank(false)} onAdd={handleAddBank} isPending={addMutation.isPending} />}
      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><CreditCard size={14} className="text-[var(--color-teal)]" /><p className="text-sm font-semibold text-[var(--color-text)]">Saved payment methods</p></div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddBank(true)} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-cream-dark)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors"><Plus size={12} /> Add bank</button>
              <button onClick={() => setShowAddCard(true)} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-cream-dark)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors"><Plus size={12} /> Add card</button>
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-[var(--color-text-faint)]"><Loader2 size={16} className="animate-spin" /><span className="text-sm">Loading payment methods…</span></div>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => (
                <div key={card.id} className={`flex items-center gap-4 rounded-xl border p-4 ${card.is_default ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)]' : 'border-[var(--color-cream-dark)]'}`}>
                  <div className="flex h-9 w-14 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white" style={{ background: BRAND_COLORS[card.brand ?? ''] ?? '#64748b' }}>{(card.brand ?? 'Card').toUpperCase().slice(0, 4)}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[var(--color-text)]">{card.brand} •••• {card.last4}</p><p className="text-xs text-[var(--color-text-faint)]">Expires {card.exp_month} / {card.exp_year}</p></div>
                  {!card.is_default && <button onClick={() => defaultMutation.mutate(card.id)} disabled={defaultMutation.isPending} title="Set as default" className="text-[var(--color-text-faint)] hover:text-[var(--color-teal)] transition-colors"><Star size={14} /></button>}
                  {card.is_default && <span className="rounded-full bg-[var(--color-teal)] px-2.5 py-0.5 text-xs font-bold text-white">Default</span>}
                  <button onClick={() => deleteMutation.mutate(card.id)} disabled={deleteMutation.isPending} className="text-[var(--color-text-faint)] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
              {banks.map((bank) => (
                <div key={bank.id} className={`flex items-center gap-4 rounded-xl border p-4 ${bank.is_default ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)]' : 'border-[var(--color-cream-dark)]'}`}>
                  <div className="flex h-9 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--color-slate)] text-white"><Landmark size={18} /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[var(--color-text)]">{bank.bank_name} •••• {bank.last4}</p><p className="text-xs capitalize text-[var(--color-text-faint)]">{bank.account_type} account · ACH</p></div>
                  <span className="rounded-full bg-[var(--color-cream)] px-2.5 py-0.5 text-xs font-semibold capitalize text-[var(--color-text-muted)]">{bank.account_type}</span>
                  {!bank.is_default && <button onClick={() => defaultMutation.mutate(bank.id)} disabled={defaultMutation.isPending} title="Set as default" className="text-[var(--color-text-faint)] hover:text-[var(--color-teal)] transition-colors"><Star size={14} /></button>}
                  {bank.is_default && <span className="rounded-full bg-[var(--color-teal)] px-2.5 py-0.5 text-xs font-bold text-white">Default</span>}
                  <button onClick={() => deleteMutation.mutate(bank.id)} disabled={deleteMutation.isPending} className="text-[var(--color-text-faint)] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
              {!isLoading && methods.length === 0 && <p className="py-8 text-center text-sm text-[var(--color-text-faint)]">No payment methods saved yet.</p>}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-teal-pale)]"><Shield size={14} className="text-[var(--color-teal)]" /></div>
            <div><p className="text-sm font-semibold text-[var(--color-text)]">Stripe Connect</p><p className="text-xs text-[var(--color-text-faint)]">Escrow, instant payouts and automatic holds</p></div>
            <span className="ml-auto rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Coming soon</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">Funds are held in escrow when a shipment is assigned and released to the carrier upon delivery confirmation.</p>
          <button disabled className="mt-4 w-full rounded-xl border border-[var(--color-cream-dark)] py-2.5 text-sm font-semibold text-[var(--color-text-faint)] cursor-not-allowed">Connect Stripe account</button>
        </div>
      </div>
    </>
  );
}

// ── Tab: Notifications ────────────────────────────────────────────────────────

function NotificationsTab({ initialData }: { initialData: ShipperProfile }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState<Record<string, boolean>>(initialData.notif_email);
  const [sms,   setSms]   = useState<Record<string, boolean>>(initialData.notif_sms);
  const [saved, setSaved] = useState(false);

  const setE = (k: string) => (v: boolean) => { setEmail((s) => ({ ...s, [k]: v })); setSaved(false); };
  const setS = (k: string) => (v: boolean) => { setSms((s)   => ({ ...s, [k]: v })); setSaved(false); };

  const saveMutation = useMutation({
    mutationFn: () => profileApi.updateShipper({ notif_email: email, notif_sms: sms }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipper-profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={14} className="text-[var(--color-teal)]" />
          <p className="text-sm font-semibold text-[var(--color-text)]">Email notifications</p>
          <span className="ml-auto text-xs text-[var(--color-text-faint)]">{initialData.email}</span>
        </div>
        <Toggle checked={!!email.carrier_assigned} onChange={setE('carrier_assigned')} label="Carrier assigned"      sub="When a carrier accepts your shipment" />
        <Toggle checked={!!email.pickup_confirmed}  onChange={setE('pickup_confirmed')}  label="Pickup confirmed"       sub="When carrier confirms pickup" />
        <Toggle checked={!!email.in_transit}        onChange={setE('in_transit')}        label="In-transit GPS updates" sub="Every new GPS ping from the carrier" />
        <Toggle checked={!!email.delivered}         onChange={setE('delivered')}         label="Delivered"              sub="When delivery is confirmed with photo" />
        <Toggle checked={!!email.disputed}          onChange={setE('disputed')}          label="Dispute raised"         sub="Immediately when a dispute is opened" />
        <Toggle checked={!!email.weekly_summary}    onChange={setE('weekly_summary')}    label="Weekly summary"         sub="Overview of all shipment activity" />
        <Toggle checked={!!email.marketing}         onChange={setE('marketing')}         label="News & promotions"      sub="Product updates and feature announcements" />
      </div>
      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Phone size={14} className="text-[var(--color-teal)]" />
          <p className="text-sm font-semibold text-[var(--color-text)]">SMS notifications</p>
          <span className="ml-auto text-xs text-[var(--color-text-faint)]">{initialData.phone || 'No phone on file'}</span>
        </div>
        <Toggle checked={!!sms.carrier_assigned} onChange={setS('carrier_assigned')} label="Carrier assigned"   sub="Text when a carrier accepts" />
        <Toggle checked={!!sms.pickup_confirmed}  onChange={setS('pickup_confirmed')}  label="Pickup confirmed"   sub="Text when carrier picks up" />
        <Toggle checked={!!sms.in_transit}        onChange={setS('in_transit')}        label="In-transit updates" sub="Text on each GPS ping" />
        <Toggle checked={!!sms.delivered}         onChange={setS('delivered')}         label="Delivered"          sub="Text on delivery confirmation" />
        <Toggle checked={!!sms.disputed}          onChange={setS('disputed')}          label="Dispute raised"     sub="Immediate text on dispute" />
      </div>
      <SaveBar saved={saved} onSave={() => saveMutation.mutate()} isPending={saveMutation.isPending} />
    </div>
  );
}

// ── Tab: Subscription (static — Stripe not yet integrated) ────────────────────

const PLANS = {
  monthly: { price: 100, label: '$100', period: 'mo', total: '$100/mo', billedAs: '$100 billed monthly' },
  yearly:  { price: 999, label: '$999', period: 'yr', total: '$83/mo',  billedAs: '$999 billed annually' },
} as const;
type BillingCycle = keyof typeof PLANS;
const FEATURES = [
  'Unlimited shipments', 'Live GPS tracking with 5-second updates', 'OSRM real-road route planning',
  'Multi-stop route builder', 'Carrier marketplace access', 'Escrow payment protection',
  'Dispute resolution support', 'Priority email & chat support',
];

function SubscriptionTab() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const plan = PLANS[cycle];
  const [currentCycle] = useState<BillingCycle>('monthly');
  const isCurrentPlan = cycle === currentCycle;
  const nextBilling = 'July 1, 2026'; const memberSince = 'June 1, 2026';
  const yearlySaving = PLANS.monthly.price * 12 - PLANS.yearly.price;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-teal)] bg-[var(--color-teal-pale)] p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-teal)] text-white"><Zap size={18} /></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[var(--color-slate)]">Professional Plan — Active</p><p className="text-xs text-[var(--color-text-faint)]">Billed monthly · Next charge <strong>$100</strong> on {nextBilling}</p></div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Active</span>
      </div>
      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
        <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">Billing cycle</p>
        <div className="flex gap-3">
          {(['monthly', 'yearly'] as BillingCycle[]).map((c) => (
            <button key={c} onClick={() => setCycle(c)} className={`relative flex-1 rounded-xl border-2 p-4 text-left transition-all ${cycle === c ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)]' : 'border-[var(--color-cream-dark)] hover:border-[var(--color-teal)]/50'}`}>
              {c === 'yearly' && <span className="absolute -top-2.5 right-3 rounded-full bg-[var(--color-teal)] px-2.5 py-0.5 text-xs font-bold text-white">Save ${yearlySaving}</span>}
              <p className="text-lg font-bold text-[var(--color-slate)]">{PLANS[c].label}<span className="text-sm font-normal text-[var(--color-text-faint)]">/{PLANS[c].period}</span></p>
              <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">{c === 'yearly' ? `${PLANS.yearly.total} · billed yearly` : 'Billed monthly'}</p>
              {c === currentCycle && <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-teal)]"><Check size={11} /> Current plan</span>}
            </button>
          ))}
        </div>
        <button disabled={isCurrentPlan} className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold transition-all ${isCurrentPlan ? 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed' : 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm'}`}>
          {isCurrentPlan ? 'This is your current plan' : cycle === 'yearly' ? `Switch to yearly — save $${yearlySaving}/yr` : 'Switch to monthly billing'}
        </button>
      </div>
      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
        <div className="flex items-center gap-2 mb-4"><Zap size={14} className="text-[var(--color-teal)]" /><p className="text-sm font-semibold text-[var(--color-text)]">What&apos;s included</p></div>
        <ul className="space-y-2.5">{FEATURES.map((f) => (<li key={f} className="flex items-center gap-3 text-sm text-[var(--color-text)]"><div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50"><Check size={11} className="text-emerald-600" /></div>{f}</li>))}</ul>
      </div>
      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
        <div className="flex items-center gap-2 mb-4"><CalendarDays size={14} className="text-[var(--color-teal)]" /><p className="text-sm font-semibold text-[var(--color-text)]">Billing details</p></div>
        <div className="space-y-3">
          {[
            { label: 'Plan', value: 'Professional (Monthly)' }, { label: 'Amount', value: '$100.00 / month' },
            { label: 'Next billing', value: nextBilling }, { label: 'Member since', value: memberSince },
            { label: 'Payment method', value: 'Visa •••• 4242' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1 border-b border-[var(--color-cream-dark)] last:border-0">
              <span className="text-sm text-[var(--color-text-faint)]">{label}</span>
              <span className="text-sm font-medium text-[var(--color-text)]">{value}</span>
            </div>
          ))}
        </div>
        <button className="mt-4 flex w-full items-center justify-between rounded-xl border border-[var(--color-cream-dark)] px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors">
          <span className="flex items-center gap-2"><RefreshCw size={13} /> View billing history</span>
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
        <p className="mb-1 text-sm font-semibold text-red-700">Cancel subscription</p>
        <p className="mb-4 text-xs text-red-600/80 leading-relaxed">Your plan stays active until the end of the current billing period ({nextBilling}).</p>
        <button className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">Cancel subscription</button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: User       },
  { id: 'business',      label: 'Business',      icon: Building2  },
  { id: 'payment',       label: 'Payment',       icon: CreditCard },
  { id: 'subscription',  label: 'Subscription',  icon: Zap        },
  { id: 'notifications', label: 'Notifications', icon: Bell       },
];

export default function ShipperProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const { data: profile, isLoading } = useQuery<ShipperProfile>({
    queryKey: ['shipper-profile'],
    queryFn:  () => profileApi.getShipper().then((r) => r.data.data),
  });

  return (
    <div className="w-[75%] min-w-[560px] space-y-6">
      <div>
        <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
          Account Settings
        </h1>
        <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">
          Manage your profile, business, payments, subscription and notifications
        </p>
      </div>

      <div className="flex gap-1 rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeTab === id ? 'bg-[var(--color-slate)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Loading skeleton for API-driven tabs */}
      {isLoading && (activeTab === 'profile' || activeTab === 'business' || activeTab === 'notifications') && (
        <div className="space-y-4 animate-pulse">
          <div className="h-36 rounded-2xl bg-[var(--color-cream-dark)]" />
          <div className="h-48 rounded-2xl bg-[var(--color-cream-dark)]" />
        </div>
      )}

      {!isLoading && profile && activeTab === 'profile'       && <ProfileTab       initialData={profile} />}
      {!isLoading && profile && activeTab === 'business'      && <BusinessTab      initialData={profile} />}
      {!isLoading && profile && activeTab === 'notifications' && <NotificationsTab initialData={profile} />}
      {activeTab === 'payment'       && <PaymentTab />}
      {activeTab === 'subscription'  && <SubscriptionTab />}
    </div>
  );
}
