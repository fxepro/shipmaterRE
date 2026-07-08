'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, kycApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Loader2, ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion,
  CheckCircle2, AlertCircle, ExternalLink, RefreshCw, CalendarDays, User,
} from 'lucide-react';

const inputCls = 'w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-colors';

// ── KYC status types ──────────────────────────────────────────────────────────

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

// ── KYC Status Card ───────────────────────────────────────────────────────────

function KycStatusCard() {
  const [launching, setLaunching] = useState(false);

  const { data: kyc, isLoading, refetch } = useQuery<KycData>({
    queryKey: ['kyc-status'],
    queryFn:  () => kycApi.status().then(r => r.data.data),
    staleTime: 30_000,
  });

  const checkStatus = kyc?.identity_check?.status;

  // Start Stripe Identity verification
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
      icon: ShieldCheck,
      cls:  'border-emerald-200 bg-emerald-50',
      label:'Identity Verified',
      desc: `Verified${kyc?.identity_verified_at ? ' on ' + new Date(kyc.identity_verified_at).toLocaleDateString() : ''}`,
    },
    pending: {
      icon: ShieldQuestion,
      cls:  'border-amber-200 bg-amber-50',
      label:'Verification Pending',
      desc: 'Stripe is processing your documents.',
    },
    manual_review: {
      icon: ShieldAlert,
      cls:  'border-orange-200 bg-orange-50',
      label:'Under Review',
      desc: kyc?.identity_check?.last_error ?? 'Additional review required.',
    },
    failed: {
      icon: ShieldX,
      cls:  'border-red-200 bg-red-50',
      label:'Verification Failed',
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

      {/* Identity Verification */}
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
                {cfg ? cfg.desc : 'Government ID + selfie required to carry regulated freight.'}
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
                {launching
                  ? <Loader2 size={12} className="animate-spin" />
                  : <ExternalLink size={12} />
                }
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

        {/* What gets verified */}
        {!checkStatus && (
          <div className="mt-3 pt-3 border-t border-[var(--color-cream-dark)] grid grid-cols-3 gap-2">
            {[
              'Government-issued ID (driver\'s license or passport)',
              'Selfie match against ID photo',
              'Liveness check (prevents spoofing)',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle2 size={11} className="text-[var(--color-teal)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--color-text-faint)]">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Age Verification */}
      <div className={`rounded-xl border p-3.5 flex items-center gap-3 ${
        kyc?.age_verified
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-[var(--color-cream-dark)] bg-[var(--color-cream)]'
      }`}>
        <CalendarDays size={16} className={kyc?.age_verified ? 'text-emerald-600' : 'text-[var(--color-text-faint)]'} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {kyc?.age_verified ? 'Age Verified (18+)' : 'Age Not Verified'}
          </p>
          <p className="text-xs text-[var(--color-text-faint)]">
            {kyc?.age_verified
              ? `Date of birth confirmed${kyc.age_verified_at ? ' on ' + new Date(kyc.age_verified_at).toLocaleDateString() : ''}`
              : 'Save your date of birth below to verify your age.'
            }
          </p>
        </div>
        {kyc?.age_verified && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
      </div>

      {/* Notice if identity not verified and attempting to work */}
      {!kyc?.identity_verified && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">
          <AlertCircle size={14} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            Identity verification is required to accept loads on the Shipmater platform. You may browse available jobs while this is pending.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main PersonalTab ──────────────────────────────────────────────────────────

interface PersonalInfo {
  date_of_birth?: string;
  ssn_last_4?: string;
}

export function PersonalTab() {
  const qc           = useQueryClient();
  const searchParams = useSearchParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['carrier-profile'],
    queryFn:  () => api.get('/api/v1/carrier/profile').then(r => r.data?.data),
    retry: false,
  });

  const [form,    setForm]    = useState<PersonalInfo>({ date_of_birth: '', ssn_last_4: '' });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (profile && !isReady) {
      setForm({
        date_of_birth: profile.date_of_birth ?? '',
        ssn_last_4:    profile.ssn_last_4    ?? '',
      });
      setIsReady(true);
    }
  }, [profile, isReady]);

  // Handle Stripe Identity redirect result
  useEffect(() => {
    const status = searchParams?.get('identity');
    if (status === 'success') {
      toast.success('Identity verification submitted! We\'ll update your status shortly.');
      qc.invalidateQueries({ queryKey: ['kyc-status'] });
    } else if (status === 'cancelled') {
      toast.info('Verification cancelled. You can restart anytime.');
    }
  }, [searchParams, qc]);

  const saveMutation = useMutation({
    mutationFn: (data: PersonalInfo) => api.put('/api/v1/carrier/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      qc.invalidateQueries({ queryKey: ['kyc-status'] });
      toast.success('Personal info saved.');
    },
    onError: () => toast.error('Failed to save.'),
  });

  const field = useCallback(
    (key: keyof PersonalInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
    []
  );

  if (isLoading) return <div className="py-8 text-center text-sm text-[var(--color-text-faint)]">Loading…</div>;

  return (
    <div className="space-y-6">

      {/* KYC Status */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <User size={14} className="text-[var(--color-teal)]" />
          <p className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-faint)]">
            Identity & Age Verification
          </p>
        </div>
        <KycStatusCard />
      </div>

      {/* Personal fields */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={14} className="text-[var(--color-teal)]" />
          <p className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-faint)]">
            Personal Details
          </p>
        </div>

        <div className="space-y-4">
          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date_of_birth ?? ''}
              onChange={field('date_of_birth')}
              className={inputCls}
            />
            <p className="text-xs text-[var(--color-text-faint)] mt-1">
              Must be 18+ to carry freight. Saving this date auto-verifies your age.
            </p>
          </div>

          {/* SSN Last 4 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
              SSN Last 4 Digits
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={form.ssn_last_4 ?? ''}
              onChange={e => setForm(prev => ({ ...prev, ssn_last_4: e.target.value.replace(/\D/g, '') }))}
              className={inputCls}
              placeholder="1234"
            />
            <p className="text-xs text-[var(--color-text-faint)] mt-1">
              Only last 4 stored. Full SSN required only during Stripe payout onboarding.
            </p>
          </div>
        </div>
      </div>

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
