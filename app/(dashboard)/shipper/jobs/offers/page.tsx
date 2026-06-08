'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Radio, ArrowRight } from 'lucide-react';
import { shipmentApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { BidCard } from '@/components/shipments/BidCard';
import { FreightPaymentModal } from '@/components/payments/FreightPaymentModal';
import { formatDate } from '@/lib/utils';
import type { Shipment } from '@/types/shipment';
import type { Bid } from '@/types/bid';

interface PendingAccept {
  bidId: number;
  carrierName: string;
  route: string;
  itemDescription: string;
}

export default function ShipperOffersPage() {
  const qc = useQueryClient();
  const [pendingAccept, setPendingAccept] = useState<PendingAccept | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ['shipper-offers'],
    queryFn: () => shipmentApi.list({ phase: 'jobs', status: 'bidding', with_bids: '1' }),
  });

  const shipments: Shipment[] = res?.data?.data ?? [];

  function handleAcceptBid(bid: Bid, shipment: Shipment) {
    setPendingAccept({
      bidId:           bid.id,
      carrierName:     bid.carrier_name ?? 'Carrier',
      route:           `${shipment.pickup_city}, ${shipment.pickup_state} → ${shipment.delivery_city}, ${shipment.delivery_state}`,
      itemDescription: shipment.item_description,
    });
  }

  function handleAccepted() {
    qc.invalidateQueries({ queryKey: ['shipper-offers'] });
    qc.invalidateQueries({ queryKey: ['shipper-jobs'] });
    qc.invalidateQueries({ queryKey: ['shipper-shipments'] });
  }

  return (
    <>
      {pendingAccept && (
        <FreightPaymentModal
          bidId={pendingAccept.bidId}
          carrierName={pendingAccept.carrierName}
          route={pendingAccept.route}
          itemDescription={pendingAccept.itemDescription}
          onAccepted={handleAccepted}
          onClose={() => setPendingAccept(null)}
        />
      )}

      <div className="space-y-8">
        <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
          Incoming Offers
        </h1>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-48 bg-[var(--color-cream-dark)] rounded animate-pulse" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-44 rounded-xl bg-[var(--color-cream)] animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : shipments.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No incoming bids"
            description="When carriers bid on your open jobs, they'll appear here for review."
          />
        ) : (
          <div className="space-y-8">
            {shipments.map((shipment) => {
              const bids: Bid[] = (shipment.bids ?? []).filter((b) => b.status === 'pending');
              if (bids.length === 0) return null;

              return (
                <div key={shipment.id}>
                  <div className="mb-4 flex items-center gap-3">
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{shipment.item_description}</p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <span>{shipment.pickup_city}, {shipment.pickup_state}</span>
                        <ArrowRight size={10} className="text-[var(--color-text-faint)]" />
                        <span>{shipment.delivery_city}, {shipment.delivery_state}</span>
                        {shipment.pickup_date && (
                          <span className="text-[var(--color-text-faint)]">· Pickup {formatDate(shipment.pickup_date)}</span>
                        )}
                      </div>
                    </div>
                    <span className="ml-auto shrink-0 text-xs font-medium bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5">
                      {bids.length} bid{bids.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {bids.map((bid) => (
                      <BidCard
                        key={bid.id}
                        bid={bid}
                        onAccept={() => handleAcceptBid(bid, shipment)}
                        isAccepting={pendingAccept?.bidId === bid.id}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
