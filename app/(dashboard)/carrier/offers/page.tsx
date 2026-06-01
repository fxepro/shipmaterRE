'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radio, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { bidApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { CarrierOffer } from '@/types/bid';

type Filter = 'all' | 'pending' | 'accepted' | 'rejected';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  accepted:  'bg-emerald-50 text-emerald-700',
  rejected:  'bg-red-50 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pending',
  accepted:  'Accepted',
  rejected:  'Rejected',
  withdrawn: 'Withdrawn',
};

export default function CarrierOffersPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['carrier-offers'],
    queryFn: () => bidApi.carrierOffers(),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: number) => bidApi.withdraw(id),
    onSuccess: () => {
      toast.success('Bid withdrawn.');
      qc.invalidateQueries({ queryKey: ['carrier-offers'] });
      qc.invalidateQueries({ queryKey: ['jobs-open'] });
    },
    onError: () => toast.error('Failed to withdraw bid.'),
  });

  const allOffers: CarrierOffer[] = res?.data?.data ?? [];
  const offers = filter === 'all' ? allOffers : allOffers.filter((o) => o.status === filter);

  const filterCls = (f: Filter) =>
    f === filter
      ? 'bg-[var(--color-teal)] text-white'
      : 'bg-[var(--color-cream)] text-[var(--color-text-muted)] hover:bg-[var(--color-cream-dark)] border border-[var(--color-cream-dark)]';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>My Offers</h1>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'accepted', 'rejected'] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filterCls(f)}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-[var(--color-cream)] animate-pulse" />)}</div>
      ) : offers.length === 0 ? (
        <EmptyState icon={Radio} title="No bids yet" description="Bids you place on open jobs will appear here." />
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-5 py-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-text)] truncate">{offer.item_description}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <ArrowRight size={10} className="text-[var(--color-text-faint)]" />
                    <span>{offer.route}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--color-text-faint)]">
                    <span>Est. pickup: {formatDate(offer.estimated_pickup_date)}</span>
                    <span>Est. delivery: {formatDate(offer.estimated_delivery_date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
                      {formatCurrency(offer.amount)}
                    </p>
                    <p className="text-xs text-[var(--color-text-faint)]">your bid</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[offer.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABELS[offer.status] ?? offer.status}
                  </span>
                </div>
              </div>

              {offer.note && (
                <p className="mt-2 text-xs text-[var(--color-text-muted)] italic">&ldquo;{offer.note}&rdquo;</p>
              )}

              {offer.status === 'pending' && (
                <div className="mt-3 pt-3 border-t border-[var(--color-cream-dark)]">
                  <button
                    onClick={() => withdrawMutation.mutate(offer.id)}
                    disabled={withdrawMutation.isPending}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-faint)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-60"
                  >
                    {withdrawMutation.isPending && <Loader2 size={11} className="animate-spin" />}
                    Withdraw bid
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
