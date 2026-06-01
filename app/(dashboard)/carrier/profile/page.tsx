'use client';

import { useState } from 'react';
import { ShieldCheck, Upload, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { profileApi } from '@/lib/api';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const inputCls = 'w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-colors';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-4">{title}</p>
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 animate-pulse">
      <div className="h-3 w-24 bg-[var(--color-cream-dark)] rounded mb-4" />
      <div className="space-y-3">
        <div className="h-9 bg-[var(--color-cream)] rounded-lg" />
        <div className="h-9 bg-[var(--color-cream)] rounded-lg" />
        <div className="h-9 w-40 bg-[var(--color-cream)] rounded-lg" />
      </div>
    </div>
  );
}

interface CarrierProfile {
  name: string;
  email: string;
  avatar: string;
  dot_number: string;
  mc_number: string;
  company_name: string;
  phone: string;
  dot_verified: boolean;
  insurance_verified: boolean;
  background_check_status: 'not_started' | 'pending' | 'passed' | 'failed';
  rating: number;
  total_deliveries: number;
  member_since: string;
}

export default function CarrierProfilePage() {
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery<CarrierProfile>({
    queryKey: ['carrier-profile'],
    queryFn: async () => {
      const res = await profileApi.getCarrier();
      return res.data.data as CarrierProfile;
    },
  });

  // ── Identity form ────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [identityInit, setIdentityInit] = useState(false);

  if (profile && !identityInit) {
    setName(profile.name);
    setPhone(profile.phone);
    setIdentityInit(true);
  }

  const identityMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => profileApi.updateCarrier(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      toast.success('Profile updated.');
    },
    onError: () => toast.error('Failed to save. Try again.'),
  });

  // ── DOT / MC form ────────────────────────────────────────────────────────
  const [dotNumber, setDotNumber] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [dotInit, setDotInit] = useState(false);

  if (profile && !dotInit) {
    setDotNumber(profile.dot_number);
    setMcNumber(profile.mc_number);
    setCompanyName(profile.company_name);
    setDotInit(true);
  }

  const dotMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => profileApi.updateCarrier(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      toast.success('Authority info saved.');
    },
    onError: () => toast.error('Failed to save. Try again.'),
  });

  // ── Background check status label ────────────────────────────────────────
  const bgStatus = profile?.background_check_status ?? 'not_started';
  const bgLabel: Record<string, string> = {
    not_started: 'Background check not submitted',
    pending:     'Background check in progress',
    passed:      'Background check passed',
    failed:      'Background check failed',
  };
  const bgIcon: Record<string, React.ReactNode> = {
    not_started: <AlertCircle size={16} className="text-[var(--color-warning)] shrink-0 mt-0.5" />,
    pending:     <Loader2 size={16} className="text-[var(--color-teal)] shrink-0 mt-0.5 animate-spin" />,
    passed:      <CheckCircle2 size={16} className="text-[var(--color-sage)] shrink-0 mt-0.5" />,
    failed:      <AlertCircle size={16} className="text-[var(--color-danger)] shrink-0 mt-0.5" />,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>Carrier Profile</h1>

      {/* ── Identity ──────────────────────────────────────────────────────── */}
      {isLoading ? <SkeletonCard /> : (
        <SectionCard title="Personal Info">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">Full Name</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">Phone</label>
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
            <button
              onClick={() => identityMutation.mutate({ name, phone })}
              disabled={identityMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
            >
              {identityMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </SectionCard>
      )}

      {/* ── DOT / MC ──────────────────────────────────────────────────────── */}
      {isLoading ? <SkeletonCard /> : (
        <SectionCard title="DOT & Authority">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">Company Name</label>
              <input className={inputCls} placeholder="Acme Trucking LLC" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">DOT Number</label>
              <div className="flex items-center gap-3">
                <input className={inputCls} placeholder="1234567" value={dotNumber} onChange={(e) => setDotNumber(e.target.value)} />
                {profile?.dot_verified
                  ? <VerifiedBadge label="Verified" size="md" />
                  : <span className="shrink-0 text-xs font-medium text-[var(--color-text-faint)] bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-full px-2.5 py-1">Not verified</span>
                }
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">MC Authority Number</label>
              <input className={inputCls} placeholder="MC-123456" value={mcNumber} onChange={(e) => setMcNumber(e.target.value)} />
            </div>
            <button
              onClick={() => dotMutation.mutate({ dot_number: dotNumber, mc_number: mcNumber, company_name: companyName })}
              disabled={dotMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-slate)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-slate-80)] disabled:opacity-60 transition-colors"
            >
              {dotMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {dotMutation.isPending ? 'Saving…' : 'Save Authority Info'}
            </button>
          </div>
        </SectionCard>
      )}

      {/* ── Insurance ─────────────────────────────────────────────────────── */}
      <SectionCard title="Insurance Document">
        <div className="rounded-xl border-2 border-dashed border-[var(--color-cream-dark)] p-8 text-center">
          {profile?.insurance_verified ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 size={24} className="text-[var(--color-sage)]" />
              <p className="text-sm font-medium text-[var(--color-text)]">Insurance verified</p>
              <p className="text-xs text-[var(--color-text-faint)]">Your coverage is on file and active</p>
            </div>
          ) : (
            <>
              <Upload size={24} className="mx-auto mb-2 text-[var(--color-text-faint)]" />
              <p className="text-sm text-[var(--color-text-muted)]">Upload insurance certificate (PDF or image)</p>
              <p className="mt-1 text-xs text-[var(--color-text-faint)]">Max 10 MB</p>
              <input type="file" accept=".pdf,image/*" className="hidden" id="insurance-upload" />
              <label
                htmlFor="insurance-upload"
                className="mt-4 inline-block cursor-pointer rounded-lg bg-[var(--color-cream)] border border-[var(--color-cream-dark)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-teal)] transition-colors"
              >
                Choose file
              </label>
            </>
          )}
        </div>
      </SectionCard>

      {/* ── Background Check ──────────────────────────────────────────────── */}
      <SectionCard title="Background Check">
        <div className="flex items-start gap-3 rounded-lg bg-[var(--color-cream)] p-4">
          {bgIcon[bgStatus]}
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">{bgLabel[bgStatus]}</p>
            {bgStatus === 'not_started' && (
              <>
                <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                  A background check is required to access premium jobs and build shipper trust.
                </p>
                <button className="mt-3 rounded-lg bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] transition-colors">
                  Start Background Check
                </button>
              </>
            )}
            {bgStatus === 'pending' && (
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Results typically arrive within 3–5 business days.</p>
            )}
            {bgStatus === 'passed' && (
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Your background check is clear. Shippers can see this on your profile.</p>
            )}
            {bgStatus === 'failed' && (
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Contact support if you believe this is an error.</p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── Public Profile Preview ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 animate-pulse">
          <div className="h-3 w-36 bg-[var(--color-cream-dark)] rounded mb-4" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[var(--color-cream-dark)]" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-[var(--color-cream-dark)] rounded" />
              <div className="h-3 w-24 bg-[var(--color-cream)] rounded" />
            </div>
          </div>
        </div>
      ) : (
        <SectionCard title="Public Profile Preview">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-slate)] text-white text-lg font-medium shrink-0" style={{ fontFamily: 'var(--font-display)' }}>
              {profile?.avatar ?? '?'}
            </div>
            <div>
              <p className="font-medium text-[var(--color-text)]">{profile?.name ?? '—'}</p>
              <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{profile?.company_name || profile?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-muted)]">⭐ {profile?.rating?.toFixed(1) ?? '—'}</span>
                <span className="text-xs text-[var(--color-text-faint)]">· {profile?.total_deliveries ?? 0} deliveries</span>
                {profile?.dot_verified && <VerifiedBadge />}
              </div>
            </div>
            {profile?.dot_verified && (
              <ShieldCheck size={18} className="ml-auto text-[var(--color-sage)]" />
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--color-cream-dark)] grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
                {profile?.total_deliveries ?? 0}
              </p>
              <p className="text-xs text-[var(--color-text-faint)]">Deliveries</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
                {profile?.rating?.toFixed(1) ?? '—'}
              </p>
              <p className="text-xs text-[var(--color-text-faint)]">Rating</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
                {profile?.member_since ?? '—'}
              </p>
              <p className="text-xs text-[var(--color-text-faint)]">Member since</p>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
