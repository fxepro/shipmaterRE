'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, kycApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Loader2, ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion,
  CheckCircle2, AlertCircle, ExternalLink, RefreshCw, CalendarDays,
  User, Globe, Phone,
} from 'lucide-react';
import AddressFields, { type AddressValue } from '@/components/shared/AddressFields';
import CountrySelect from '@/components/shared/CountrySelect';
import { getCountry, getNationalIdTypes } from '@/lib/countries';

const inputCls = 'w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-colors';
const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5';

// ── KYC Status Card ─────────────────────────────────────────────────────────

interface KycData {
  identity_verified:    boolean;
  identity_verified_at: string | null;
  age_verified:         boolean;
  age_verified_at:      string | null;
  date_of_birth:        string | null;
  identity_check: {
    status:      string;
    external_id: string;
    last_error:  string | null;
    verified_at: string | null;
  } | null;
}

function KycStatusCard() {
  const [launching, setLaunching] = useState(false);
  const { data: kyc, isLoading, refetch } = useQuery<KycData>({
    queryKey: ['kyc-status'],
    queryFn:  () => kycApi.status().then(r => r.data.data),
    staleTime: 30_000,
  });

  const checkStatus = kyc?.identity_check?.status;

  async function startVerification() {
    setLaunching(true);
    try {
      const res = await kycApi.startIdentitySession();
      window.location.href = res.data.url;
    } catch {
      toast.error('Could not start verification. Please try again.');
      setLaunching(false);
    }
  }

  const statusConfig: Record<string, { icon: React.ElementType; cls: string; label: string; desc: string }> = {
    passed: {
      icon: ShieldCheck, cls: 'border-emerald-200 bg-emerald-50',
      label: 'Identity Verified',
      desc: `Verified${kyc?.identity_verified_at ? ' on ' + new Date(kyc.identity_verified_at).toLocaleDateString() : ''}`,
    },
    pending: {
      icon: ShieldQuestion, cls: 'border-amber-200 bg-amber-50',
      label: 'Verification Pending',
      desc: 'Stripe is processing your documents.',
    },
    manual_review: {
      icon: ShieldAlert, cls: 'border-orange-200 bg-orange-50',
      label: 'Under Review',
      desc: kyc?.identity_check?.last_error ?? 'Additional review required.',
    },
    failed: {
      icon: ShieldX, cls: 'border-red-200 bg-red-50',
      label: 'Verification Failed',
      desc: kyc?.identity_check?.last_error ?? 'Please retry with a clear government-issued ID.',
    },
  };

  const cfg = checkStatus ? (statusConfig[checkStatus] ?? statusConfig.failed) : null;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] p-4 flex items-center gap-3">
        <Loader2 size={16} className="animate-spin text-[var(--color-text-faint)]" />
        <span className="text-sm text-[var(--color-text-faint)]">Loading verification status…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border p-4 ${cfg ? cfg.cls : 'border-[var(--color-cream-dark)] bg-[var(--color-cream)]'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {cfg
              ? <cfg.icon size={20} className={
                  checkStatus === 'passed'        ? 'text-emerald-600 mt-0.5' :
                  checkStatus === 'pending'       ? 'text-amber-500 mt-0.5'  :
                  checkStatus === 'manual_review' ? 'text-orange-500 mt-0.5' :
                                                    'text-red-500 mt-0.5'
                } />
              : <ShieldQuestion size={20} className="text-[var(--color-text-faint)] mt-0.5" />
            }
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {cfg ? cfg.label : 'Identity Not Verified'}
              </p>
              <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
                {cfg ? cfg.desc : 'Government ID + selfie required. Works in 100+ countries.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(!checkStatus || checkStatus === 'failed' || checkStatus === 'manual_review') && (
              <button
                onClick={startVerification}
                disabled={launching}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--color-teal)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-teal-dark)] disabled:opacity-60 transition-colors"
              >
                {launching ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                {checkStatus === 'failed' || checkStatus === 'manual_review' ? 'Retry' : 'Verify Identity'}
              </button>
            )}
            {checkStatus === 'pending' && (
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <RefreshCw size={11} /> Refresh
              </button>
            )}
          </div>
        </div>
        {!checkStatus && (
          <div className="mt-3 pt-3 border-t border-[var(--color-cream-dark)] grid grid-cols-3 gap-2">
            {["Government-issued ID (DL or Passport)", "Selfie match against ID photo", "Liveness check (prevents spoofing)"].map((item, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle2 size={11} className="text-[var(--color-teal)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--color-text-faint)]">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Age badge */}
      <div className={`rounded-xl border p-3.5 flex items-center gap-3 ${
        kyc?.age_verified ? 'border-emerald-200 bg-emerald-50' : 'border-[var(--color-cream-dark)] bg-[var(--color-cream)]'
      }`}>
        <CalendarDays size={16} className={kyc?.age_verified ? 'text-emerald-600' : 'text-[var(--color-text-faint)]'} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {kyc?.age_verified ? 'Age Verified (18+)' : 'Age Not Verified'}
          </p>
          <p className="text-xs text-[var(--color-text-faint)]">
            {kyc?.age_verified
              ? `Date of birth confirmed${kyc.age_verified_at ? ' on ' + new Date(kyc.age_verified_at).toLocaleDateString() : ''}`
              : 'Save your date of birth below to verify your age.'}
          </p>
        </div>
        {kyc?.age_verified && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
      </div>

      {!kyc?.identity_verified && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">
          <AlertCircle size={14} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            Identity verification is required to accept loads. You may browse available jobs while pending.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main PersonalTab ─────────────────────────────────────────────────────────

interface PersonalForm {
  // Verification
  date_of_birth: string;
  // Operating region (drives conditional fields below)
  operating_country: string;
  // US-specific ID
  ssn_last_4: string;
  // Non-US ID
  national_id_type: string;
  national_id_number: string;
  // Contact
  phone: string;
  phone_e164: string;
  // Address
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export function PersonalTab() {
  const qc           = useQueryClient();
  const searchParams = useSearchParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['carrier-profile'],
    queryFn:  () => api.get('/api/v1/carrier/profile').then(r => r.data?.data),
    retry: false,
  });

  const [form, setForm] = useState<PersonalForm>({
    date_of_birth: '', operating_country: 'US',
    ssn_last_4: '', national_id_type: '', national_id_number: '',
    phone: '', phone_e164: '',
    street: '', city: '', state: '', zip: '', country: 'US',
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (profile && !isReady) {
      setForm({
        date_of_birth:     profile.date_of_birth     ?? '',
        operating_country: profile.operating_country ?? 'US',
        ssn_last_4:        profile.ssn_last_4        ?? '',
        national_id_type:  profile.national_id_type  ?? '',
        national_id_number:profile.national_id_number?? '',
        phone:             profile.phone             ?? '',
        phone_e164:        profile.phone_e164         ?? '',
        street:            profile.street            ?? '',
        city:              profile.city              ?? '',
        state:             profile.state             ?? '',
        zip:               profile.zip               ?? '',
        country:           profile.country           ?? 'US',
      });
      setIsReady(true);
    }
  }, [profile, isReady]);

  // Handle Stripe Identity redirect
  useEffect(() => {
    const status = searchParams?.get('identity');
    if (status === 'success') {
      toast.success("Identity verification submitted! We'll update your status shortly.");
      qc.invalidateQueries({ queryKey: ['kyc-status'] });
    } else if (status === 'cancelled') {
      toast.info('Verification cancelled. You can restart anytime.');
    }
  }, [searchParams, qc]);

  const saveMutation = useMutation({
    mutationFn: (data: PersonalForm) => api.put('/api/v1/carrier/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      qc.invalidateQueries({ queryKey: ['kyc-status'] });
      toast.success('Personal info saved.');
    },
    onError: () => toast.error('Failed to save.'),
  });

  const set = useCallback(
    <K extends keyof PersonalForm>(key: K) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [key]: e.target.value })),
    []
  );

  const isUS = form.operating_country === 'US';
  const isCA = form.operating_country === 'CA';
  const isMX = form.operating_country === 'MX';
  const isUSCA = isUS || isCA || isMX;
  const opCountry = getCountry(form.operating_country);
  const idTypes   = getNationalIdTypes(form.operating_country);

  const addressVal: AddressValue = {
    address: form.street, street: form.street,
    city: form.city, state: form.state, zip: form.zip, country: form.country,
  };

  if (isLoading) return <div className="py-8 text-center text-sm text-[var(--color-text-faint)]">Loading…</div>;

  return (
    <div className="space-y-8">

      {/* KYC */}
      <section>
        <SectionHeader icon={<User size={14} />} title="Identity & Age Verification" />
        <KycStatusCard />
      </section>

      {/* Operating country — drives everything below */}
      <section>
        <SectionHeader icon={<Globe size={14} />} title="Where You Operate" />
        <div className="max-w-xs">
          <CountrySelect
            value={form.operating_country}
            onChange={code => setForm(prev => ({ ...prev, operating_country: code }))}
            label="Primary operating country"
            required
          />
          <p className="text-xs text-[var(--color-text-faint)] mt-1.5">
            Determines which regulatory checks and ID fields apply.
          </p>
        </div>
      </section>

      {/* Personal details */}
      <section>
        <SectionHeader icon={<CalendarDays size={14} />} title="Personal Details" />
        <div className="space-y-4 max-w-lg">

          {/* DOB */}
          <div>
            <label className={labelCls}>
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={set('date_of_birth')}
              className={inputCls}
            />
            <p className="text-xs text-[var(--color-text-faint)] mt-1">
              Must be 18+. Saving this date auto-verifies your age.
            </p>
          </div>

          {/* ID — US: SSN last 4; CA: SIN first/last; others: national ID type + number */}
          {isUS ? (
            <div>
              <label className={labelCls}>SSN Last 4 Digits</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={form.ssn_last_4}
                onChange={e => setForm(prev => ({ ...prev, ssn_last_4: e.target.value.replace(/\D/g, '') }))}
                className={inputCls}
                placeholder="1234"
              />
              <p className="text-xs text-[var(--color-text-faint)] mt-1">
                Only last 4 stored. Full SSN collected during Stripe payout onboarding only.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ID Type</label>
                <select
                  value={form.national_id_type}
                  onChange={set('national_id_type')}
                  className={inputCls}
                >
                  <option value="">Select type…</option>
                  {idTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>ID Number</label>
                <input
                  type="text"
                  value={form.national_id_number}
                  onChange={set('national_id_number')}
                  className={inputCls}
                  placeholder={isCA ? 'e.g. 123 456 789' : isUSCA ? 'e.g. ABC123456' : 'Document number'}
                />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Contact & Address */}
      <section>
        <SectionHeader icon={<Phone size={14} />} title="Contact & Address" />
        <div className="space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                className={inputCls}
                placeholder={isUS ? '(555) 555-0100' : opCountry.dialCode + ' …'}
              />
            </div>
            {!isUS && (
              <div>
                <label className={labelCls}>International Phone (E.164)</label>
                <input
                  type="tel"
                  value={form.phone_e164}
                  onChange={set('phone_e164')}
                  className={inputCls}
                  placeholder={opCountry.dialCode + '5550100'}
                />
                <p className="text-xs text-[var(--color-text-faint)] mt-1">
                  Include country code, e.g. {opCountry.dialCode}…
                </p>
              </div>
            )}
          </div>

          <AddressFields
            value={addressVal}
            onChange={v => setForm(prev => ({
              ...prev,
              street: v.address ?? v.street ?? '',
              city: v.city, state: v.state, zip: v.zip, country: v.country,
            }))}
            showStreet
          />
        </div>
      </section>

      <button
        onClick={() => saveMutation.mutate(form)}
        disabled={saveMutation.isPending}
        className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] disabled:opacity-60 transition-colors"
      >
        {saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}
        {saveMutation.isPending ? 'Saving…' : 'Save Personal Info'}
      </button>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[var(--color-teal)]">{icon}</span>
      <p className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-faint)]">
        {title}
      </p>
    </div>
  );
}
