'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign } from 'lucide-react';
import { carrierApi, api } from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function CarrierEarningsPage() {
  const { data: res } = useQuery({ queryKey: ['carrier-earnings'], queryFn: () => carrierApi.earnings() });
  const earnings = res?.data?.data;

  async function requestPayout(method: 'stripe' | 'bank') {
    try {
      await api.post('/api/v1/carrier/payout', { method });
      toast.success('Payout request submitted.');
    } catch {
      toast.error('Failed to request payout.');
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="page-title">Earnings</h1>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="This Month"     value={earnings?.month_total ?? 0} currency accentColor="var(--color-teal)" />
        <StatCard label="All Time"       value={earnings?.all_time ?? 0} currency />
        <StatCard label="In Escrow"      value={earnings?.escrow ?? 0} currency accentColor="var(--color-warning)" />
        <StatCard label="Available"      value={earnings?.available ?? 0} currency accentColor="var(--color-success)" />
      </div>

      {/* Payout options */}
      <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
        <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1">Available Balance</p>
        <p className="text-4xl text-[var(--color-text)] mb-5" style={{ fontFamily: 'var(--font-display)' }}>
          {formatCurrency(earnings?.available ?? 0)}
        </p>
        <p className="mb-3 text-sm text-[var(--color-text-muted)]">Choose your payout method:</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => requestPayout('stripe')}
            disabled={!earnings?.available}
            className="rounded-lg border border-[var(--color-teal)] py-3 text-sm font-medium text-[var(--color-teal)] hover:bg-[var(--color-teal-pale)] disabled:opacity-40 transition-colors"
          >
            Stripe Instant Transfer
          </button>
          <button
            onClick={() => requestPayout('bank')}
            disabled={!earnings?.available}
            className="rounded-lg border border-[var(--color-cream-dark)] py-3 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] disabled:opacity-40 transition-colors"
          >
            Bank Transfer (3–5 days)
          </button>
        </div>
      </div>
    </div>
  );
}
