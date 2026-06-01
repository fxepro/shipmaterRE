'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';

interface Dispute { id: number; shipment_id: number; item_name: string; reason: string; status: string; created_at: string; }

export default function AdminDisputesPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => api.get('/api/v1/admin/disputes'),
  });

  const disputes: Dispute[] = res?.data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>Disputes</h1>

      {isLoading ? (
        <div className="skeleton h-64 rounded-xl" />
      ) : disputes.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No open disputes" description="Disputes raised by shippers or carriers will appear here." />
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="bg-[var(--color-white)] rounded-xl border border-red-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-[var(--color-text)]">{d.item_name}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{d.reason}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-faint)]">Opened {formatDate(d.created_at)}</p>
                </div>
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 capitalize">{d.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
