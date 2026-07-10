'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, CheckCircle, XCircle, Mail, Phone, FileText, Clock,
} from 'lucide-react';
import { shipperVerificationApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';

interface PendingShipper {
  id: number;
  user_id: number;
  name: string;
  email: string;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  company: string;
  ein: string;
  business_type: string | null;
  verification_status: string;
  verification_submitted_at: string | null;
  documents: { id: number; type: string; name: string; url: string | null }[];
  member_since: string;
}

export default function AdminShippersPage() {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<number, string>>({});

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-shippers-pending'],
    queryFn: () => shipperVerificationApi.adminPending(),
  });

  const review = useMutation({
    mutationFn: ({ id, action, notes: n }: { id: number; action: 'approve' | 'reject'; notes?: string }) =>
      shipperVerificationApi.adminReview(id, action, n),
    onSuccess: (_, { action }) => {
      toast.success(`Shipper ${action === 'approve' ? 'approved' : 'rejected'}`);
      qc.invalidateQueries({ queryKey: ['admin-shippers-pending'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Action failed');
    },
  });

  const shippers: PendingShipper[] = res?.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Shipper verification queue</h1>
        <p className="text-sm text-[var(--color-text-faint)] mt-1">
          Review submitted W-9 / business documents and approve EIN verification.
        </p>
      </div>

      {isLoading && <div className="skeleton h-40 rounded-xl" />}

      {!isLoading && shippers.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No pending shippers"
          description="Submitted business verifications will appear here."
        />
      )}

      <div className="space-y-4">
        {shippers.map((s) => (
          <div key={s.id} className="rounded-xl border border-[var(--color-cream-dark)] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[var(--color-text)]">{s.company || s.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{s.name} · {s.email}</p>
                <p className="text-xs text-[var(--color-text-faint)] mt-1">
                  EIN {s.ein || '—'} · {s.business_type || '—'} · Member since {s.member_since}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    s.email_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                  }`}>
                    <Mail size={9} /> Email {s.email_verified ? 'ok' : 'no'}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    s.phone_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-[var(--color-cream)] text-[var(--color-text-faint)]'
                  }`}>
                    <Phone size={9} /> Phone {s.phone_verified ? 'ok' : 'pending'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    <Clock size={9} /> Submitted {s.verification_submitted_at
                      ? new Date(s.verification_submitted_at).toLocaleString()
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {s.documents.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {s.documents.map((d) => (
                  <a
                    key={d.id}
                    href={d.url ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-cream-dark)] px-2.5 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-cream)]"
                  >
                    <FileText size={12} />
                    {d.type.toUpperCase()}: {d.name}
                  </a>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                value={notes[s.id] ?? ''}
                onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                placeholder="Review notes (optional)"
                className="profile-input flex-1 min-w-[200px]"
              />
              <button
                type="button"
                onClick={() => review.mutate({ id: s.id, action: 'approve', notes: notes[s.id] })}
                disabled={review.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                <CheckCircle size={12} /> Approve
              </button>
              <button
                type="button"
                onClick={() => review.mutate({ id: s.id, action: 'reject', notes: notes[s.id] })}
                disabled={review.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                <XCircle size={12} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
