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
    <div className="card card-body">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium" style={{ color: 'var(--text)' }}>{bid.carrier_name}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Star size={11} style={{ fill: 'var(--primary)', color: 'var(--primary)' }} />
              {bid.carrier_rating.toFixed(1)}
            </span>
            {bid.carrier_dot_verified && <VerifiedBadge />}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {formatCurrency(bid.amount)}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>flat rate</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Pickup</p>
          <p>{formatDate(bid.estimated_pickup_date)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Delivery</p>
          <p>{formatDate(bid.estimated_delivery_date)}</p>
        </div>
      </div>

      {bid.note && (
        <p className="mt-3 text-sm italic" style={{ color: 'var(--text-muted)' }}>&ldquo;{bid.note}&rdquo;</p>
      )}

      {onAccept && bid.status === 'pending' && (
        <button
          onClick={() => onAccept(bid.id)}
          disabled={isAccepting}
          className="btn btn-primary btn-block mt-4"
        >
          {isAccepting ? 'Accepting…' : 'Accept Bid'}
        </button>
      )}
    </div>
  );
}
