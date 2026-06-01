'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radio } from 'lucide-react';
import { toast } from 'sonner';
import { shipmentApi, bidApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { BidCard } from '@/components/shipments/BidCard';
import type { Shipment } from '@/types/shipment';
import type { Bid } from '@/types/bid';

export default function ShipperBidsPage() {
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['shipper-shipments'],
    queryFn: () => shipmentApi.list(),
  });

  const acceptMutation = useMutation({
    mutationFn: (bidId: number) => bidApi.accept(bidId),
    onSuccess: () => { toast.success('Bid accepted!'); qc.invalidateQueries({ queryKey: ['shipper-shipments'] }); },
    onError: () => toast.error('Failed to accept bid.'),
  });

  const shipments: (Shipment & { bids?: Bid[] })[] = res?.data?.data ?? [];
  const withBids = shipments.filter((s) => (s.bids?.length ?? 0) > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>Incoming Bids</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      ) : withBids.length === 0 ? (
        <EmptyState icon={Radio} title="No bids yet" description="Bids will appear here as carriers respond to your posted jobs." />
      ) : (
        withBids.map((shipment) => (
          <div key={shipment.id}>
            <p className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">{shipment.item_description}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(shipment.bids ?? []).map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  onAccept={shipment.status === 'bidding' ? (id) => acceptMutation.mutate(id) : undefined}
                  isAccepting={acceptMutation.isPending}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
