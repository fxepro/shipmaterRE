'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Truck, CheckCircle, XCircle, ShieldCheck, ShieldQuestion,
  BadgeCheck, AlertCircle, Clock, DollarSign,
} from 'lucide-react';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';

interface PendingCarrier {
  id:                     number;
  name:                   string;
  email:                  string;
  verification_status:    string;
  background_check_status:string | null;
  dot_verified:           boolean;
  mc_verified:            boolean;
  identity_verified:      boolean;
  identity_verified_at:   string | null;
  identity_check_status:  string | null;
  age_verified:           boolean;
  onboarding_fee_paid:    boolean;
  member_since:           string;
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

function CheckBadge({
  ok, label, pending = false,
}: { ok: boolean; label: string; pending?: boolean }) {
  if (ok) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <CheckCircle size={9} /> {label}
      </span>
    );
  }
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        <Clock size={9} /> {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-600">
      <XCircle size={9} /> {label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCarriersPage() {
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-carriers-pending'],
    queryFn: () => api.get('/api/v1/admin/carriers/pending-review'),
  });

  const review = useMutation({
    mutationFn: ({ id, action, notes }: { id: number; action: 'approve' | 'reject'; notes?: string }) =>
      api.post(`/api/v1/admin/carriers/${id}/review`, { action, notes }),
    onSuccess: (_, { action }) => {
      toast.success(`Carrier ${action === 'approve' ? 'approved' : 'rejected'}`);
      qc.invalidateQueries({ queryKey: ['admin-carriers-pending'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? 'Action failed';
      toast.error(msg);
    },
  });

  const carriers: PendingCarrier[] = res?.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">
            Carrier Approval Queue
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-faint)]">
            Identity verification is required before a carrier can be approved.
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-teal-pale)] px-3 py-1 text-sm font-semibold text-[var(--color-teal)]">
          {carriers.length} pending
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-4 py-3 text-xs text-[var(--color-text-faint)]">
        <span className="font-semibold text-[var(--color-text)]">Required to approve:</span>
        <CheckBadge ok={true}  label="Identity" />
        <span className="text-[var(--color-cream-dark)]">|</span>
        <span className="font-semibold">Recommended:</span>
        <CheckBadge ok={true}  label="DOT" />
        <CheckBadge ok={true}  label="Fee Paid" />
        <CheckBadge ok={true}  label="Background" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0,1,2].map(n => <div key={n} className="h-28 rounded-xl bg-[var(--color-cream)] animate-pulse" />)}
        </div>
      ) : carriers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No carriers pending review"
          description="New carrier registrations waiting for approval will appear here."
        />
      ) : (
        <div className="space-y-3">
          {carriers.map((c) => {
            const canApprove = c.identity_verified;
            const bgPending  = c.background_check_status === 'pending' || c.background_check_status === 'in_progress';
            const bgPassed   = c.background_check_status === 'clear' || c.background_check_status === 'passed';

            return (
              <div
                key={c.id}
                className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-start justify-between gap-4">

                  {/* Left: info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[var(--color-text)]">{c.name}</p>
                      <span className="text-xs text-[var(--color-text-faint)]">{c.member_since}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">{c.email}</p>

                    {/* Verification badges */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">

                      {/* Identity — required */}
                      <CheckBadge
                        ok={c.identity_verified}
                        pending={c.identity_check_status === 'pending'}
                        label={c.identity_verified
                          ? `ID Verified${c.identity_verified_at ? ' ' + new Date(c.identity_verified_at).toLocaleDateString() : ''}`
                          : c.identity_check_status === 'pending' ? 'ID Pending'
                          : 'ID Not Verified'}
                      />

                      {/* Age */}
                      <CheckBadge ok={c.age_verified} label="18+" />

                      {/* DOT */}
                      <CheckBadge ok={c.dot_verified} label="DOT" />

                      {/* MC */}
                      {c.mc_verified && <CheckBadge ok={true} label="MC" />}

                      {/* Background */}
                      <CheckBadge
                        ok={bgPassed}
                        pending={bgPending}
                        label={bgPassed ? 'Background Clear'
                          : bgPending    ? 'Background Pending'
                          : 'No Background Check'}
                      />

                      {/* Onboarding fee */}
                      <CheckBadge ok={c.onboarding_fee_paid} label="Fee Paid" />
                    </div>

                    {/* Identity required warning */}
                    {!c.identity_verified && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <AlertCircle size={12} className="text-red-500 shrink-0" />
                        <p className="text-xs text-red-600">
                          Cannot approve — carrier must complete identity verification first.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex shrink-0 flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <button
                        onClick={() => review.mutate({ id: c.id, action: 'approve' })}
                        disabled={review.isPending || !canApprove}
                        title={!canApprove ? 'Identity verification required before approval' : 'Approve carrier'}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          canApprove
                            ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)]'
                            : 'cursor-not-allowed bg-[var(--color-cream-dark)] text-[var(--color-text-faint)]'
                        } disabled:opacity-60`}
                      >
                        {canApprove
                          ? <><ShieldCheck size={13} /> Approve</>
                          : <><ShieldQuestion size={13} /> Approve</>
                        }
                      </button>
                      <button
                        onClick={() => review.mutate({ id: c.id, action: 'reject' })}
                        disabled={review.isPending}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-danger)] px-3 py-1.5 text-xs font-semibold text-[var(--color-danger)] transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
