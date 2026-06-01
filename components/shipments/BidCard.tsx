'use client';

import { Star } from 'lucide-react';
import type { Bid } from '@/types/bid';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BidCardProps {
  bid: Bid;
  onAccept?: (bidId: number) => void;
  isAccepting?: boolean;
}

export function BidCard({ bid, onAccept, isAccepting }: BidCardProps) {
  return (
    <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-[var(--color-text)]">{bid.carrier_name}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-sm text-[var(--color-text-muted)]">
              <Star size={11} className="fill-[var(--color-teal)] text-[var(--color-teal)]" />
              {bid.carrier_rating.toFixed(1)}
            </span>
            {bid.carrier_dot_verified && <VerifiedBadge />}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            {formatCurrency(bid.amount)}
          </p>
          <p className="text-xs text-[var(--color-text-faint)]">flat rate</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-[var(--color-text-muted)]">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-faint)]">Pickup</p>
          <p>{formatDate(bid.estimated_pickup_date)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-faint)]">Delivery</p>
          <p>{formatDate(bid.estimated_delivery_date)}</p>
        </div>
      </div>

      {bid.note && (
        <p className="mt-3 text-sm text-[var(--color-text-muted)] italic">&ldquo;{bid.note}&rdquo;</p>
      )}

      {onAccept && bid.status === 'pending' && (
        <button
          onClick={() => onAccept(bid.id)}
          disabled={isAccepting}
          className="mt-4 w-full rounded-lg bg-[var(--color-teal)] py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
        >
          {isAccepting ? 'Accepting…' : 'Accept Bid'}
        </button>
      )}
    </div>
  );
}
