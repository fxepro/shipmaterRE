'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Radio } from 'lucide-react';
import { shipmentApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { BidCard } from '@/components/shipments/BidCard';
import { FreightPaymentModal } from '@/components/payments/FreightPaymentModal';
import type { Shipment } from '@/types/shipment';
import type { Bid } from '@/types/bid';

interface PendingAccept {
  bidId: number;
  carrierName: string;
  route: string;
  itemDescription: string;
}

export default function ShipperBidsPage() {
  const qc = useQueryClient();
  const [pendingAccept, setPendingAccept] = useState<PendingAccept | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ['shipper-shipments'],
    queryFn: () => shipmentApi.list(),
  });

  const shipments: (Shipment & { bids?: Bid[] })[] = res?.data?.data ?? [];
  const withBids = shipments.filter((s) => (s.bids?.length ?? 0) > 0);

  function handleAcceptBid(bid: Bid, shipment: Shipment) {
    setPendingAccept({
      bidId:           bid.id,
      carrierName:     bid.carrier_name ?? 'Carrier',
      route:           `${shipment.pickup_city}, ${shipment.pickup_state} → ${shipment.delivery_city}, ${shipment.delivery_state}`,
      itemDescription: shipment.item_description,
    });
  }

  function handleAccepted() {
    qc.invalidateQueries({ queryKey: ['shipper-shipments'] });
    qc.invalidateQueries({ queryKey: ['shipper-jobs'] });
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

      <div className="space-y-6">
        <h1 className="page-title">
          Incoming Bids
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-xl" />
            ))}
          </div>
        ) : withBids.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No bids yet"
            description="Bids will appear here as carriers respond to your posted jobs."
          />
        ) : (
          withBids.map((shipment) => (
            <div key={shipment.id}>
              <p className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">
                {shipment.item_description}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(shipment.bids ?? []).map((bid) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    onAccept={
                      shipment.status === 'bidding'
                        ? () => handleAcceptBid(bid, shipment)
                        : undefined
                    }
                    isAccepting={pendingAccept?.bidId === bid.id}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
