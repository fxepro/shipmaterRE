'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';

interface PendingCarrier {
  id: number;
  name: string;
  email: string;
  created_at: string;
  carrier_profile?: {
    dot_number?: string;
    mc_number?: string;
    status: string;
  };
}

export default function AdminCarriersPage() {
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-carriers-pending'],
    queryFn: () => api.get('/api/v1/admin/carriers/pending-review'),
  });

  const review = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'approve' | 'reject' }) =>
      api.post(`/api/v1/admin/carriers/${id}/review`, { action }),
    onSuccess: (_, { action }) => {
      toast.success(`Carrier ${action === 'approve' ? 'approved' : 'rejected'}`);
      qc.invalidateQueries({ queryKey: ['admin-carriers-pending'] });
    },
    onError: () => toast.error('Action failed'),
  });

  const carriers: PendingCarrier[] = res?.data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
        Carrier Approval Queue
      </h1>

      {isLoading ? (
        <div className="skeleton h-64 rounded-xl" />
      ) : carriers.length === 0 ? (
        <EmptyState icon={Truck} title="No carriers pending review" description="New carrier registrations waiting for approval will appear here." />
      ) : (
        <div className="space-y-3">
          {carriers.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-text)]">{c.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{c.email}</p>
                {c.carrier_profile && (
                  <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                    {c.carrier_profile.dot_number ? `DOT ${c.carrier_profile.dot_number}` : ''}
                    {c.carrier_profile.mc_number ? ` · MC ${c.carrier_profile.mc_number}` : ''}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => review.mutate({ id: c.id, action: 'approve' })}
                  disabled={review.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-[var(--color-teal)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <CheckCircle size={13} /> Approve
                </button>
                <button
                  onClick={() => review.mutate({ id: c.id, action: 'reject' })}
                  disabled={review.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--color-danger)] px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle size={13} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
