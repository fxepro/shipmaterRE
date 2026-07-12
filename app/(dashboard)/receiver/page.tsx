'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { shipmentApi } from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusPill } from '@/components/shipments/StatusPill';
import { LiveMap } from '@/components/maps/LiveMap';
import { formatEta } from '@/lib/utils';
import type { Shipment } from '@/types/shipment';

export default function ReceiverDashboard() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['receiver-shipments'],
    queryFn: () => shipmentApi.list({ role: 'receiver' }),
  });

  const shipments: Shipment[] = res?.data?.data ?? [];
  const inTransit = shipments.find((s) => s.status === 'in_transit');
  const pending   = shipments.filter((s) => s.status !== 'delivered' && s.status !== 'cancelled');

  return (
    <div className="space-y-6">
      <h1 className="page-title">My Deliveries</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Incoming"  value={pending.length} />
        <StatCard label="In Transit" value={shipments.filter((s) => s.status === 'in_transit').length} accentColor="var(--color-teal)" />
        <StatCard label="Delivered" value={shipments.filter((s) => s.status === 'delivered').length} accentColor="var(--color-success)" />
      </div>

      {/* Live map if something en route */}
      {inTransit && inTransit.pickup_lat && inTransit.pickup_lng && inTransit.delivery_lat && inTransit.delivery_lng && (
        <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-cream-dark)]">
            <div>
              <p className="font-medium text-[var(--color-text)]">{inTransit.item_description}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {inTransit.pickup_city} → {inTransit.delivery_city}
                {inTransit.latest_ping?.eta && ` · ETA ${formatEta(inTransit.latest_ping.eta)}`}
              </p>
            </div>
            <StatusPill status={inTransit.status} />
          </div>
          <LiveMap
            shipmentId={inTransit.id}
            initialCoordinates={{ lat: inTransit.pickup_lat, lng: inTransit.pickup_lng }}
            pickupCoordinates={{ lat: inTransit.pickup_lat, lng: inTransit.pickup_lng }}
            deliveryCoordinates={{ lat: inTransit.delivery_lat, lng: inTransit.delivery_lng }}
            deliveryAddress={inTransit.delivery_address}
            eta={inTransit.latest_ping?.eta}
            className="h-[300px] w-full"
          />
        </div>
      )}

      {/* Shipments list */}
      <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="px-5 py-4 border-b border-[var(--color-cream-dark)]">
          <p className="font-medium text-[var(--color-text)]">All Deliveries</p>
        </div>
        {isLoading ? (
          <div className="skeleton h-48 m-4 rounded-lg" />
        ) : shipments.length === 0 ? (
          <EmptyState icon={Package} title="No deliveries yet" description="Your incoming shipments will appear here." />
        ) : (
          <div className="divide-y divide-[var(--color-cream-dark)]">
            {shipments.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-sm text-[var(--color-text)]">{s.item_description}</p>
                  <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                    {s.pickup_city} <ArrowRight size={10} /> {s.delivery_city}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {s.latest_ping?.eta && <span className="text-xs text-[var(--color-text-faint)]">ETA {formatEta(s.latest_ping.eta)}</span>}
                  <StatusPill status={s.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
