'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import { shipmentApi } from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ShipmentTable } from '@/components/shipments/ShipmentTable';
import { ShipmentPanel } from '@/components/shipments/ShipmentPanel';
import { ActivityFeed } from '@/components/shared/ActivityFeed';
import type { Shipment } from '@/types/shipment';

function SkeletonCard() {
  return <div className="skeleton h-[104px] rounded-xl" />;
}

export default function ShipperDashboard() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: shipmentsRes, isLoading } = useQuery({
    queryKey: ['shipper-shipments'],
    queryFn: () => shipmentApi.list(),
  });

  const shipments: Shipment[] = shipmentsRes?.data?.data ?? [];

  const stats = [
    {
      label: 'Active Shipments',
      value: shipments.filter((s) => ['assigned', 'in_transit'].includes(s.status)).length,
    },
    {
      label: 'Pending',
      value: shipments.filter((s) => s.status === 'pending').length,
      accentColor: 'var(--color-sage)',
    },
    {
      label: 'Delivered',
      value: shipments.filter((s) => s.status === 'delivered').length,
      accentColor: 'var(--color-success)',
    },
    {
      label: 'Total Spent',
      value: shipments
        .reduce((acc, s) => acc + (s.agreed_cost ?? 0), 0)
        .toLocaleString('en-US', { minimumFractionDigits: 0 }),
      currency: true,
      accentColor: 'var(--color-slate-60)',
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
            Dashboard
          </h1>
          <Link
            href="/shipper/shipments/new"
            className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] transition-colors"
          >
            <Plus size={15} /> New Shipment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((s) => <StatCard key={s.label} {...s} />)
          }
        </div>

        {/* Recent shipments table */}
        <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-cream-dark)]">
            <p className="font-medium text-[var(--color-text)]">Recent Shipments</p>
            <Link href="/shipper/shipments" className="text-sm font-medium text-[var(--color-teal)] hover:underline">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="skeleton h-48 m-4 rounded-lg" />
          ) : shipments.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No shipments yet"
              description="Create your first shipment to get started."
              action={{ label: 'New Shipment', onClick: () => {} }}
            />
          ) : (
            <div className="p-1">
              <ShipmentTable
                shipments={shipments.slice(0, 5)}
                onView={setSelectedId}
              />
            </div>
          )}
        </div>

        {/* Bottom row: activity */}
        <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
          <p className="mb-4 font-medium text-[var(--color-text)]">Activity</p>
          <ActivityFeed items={[]} />
          {shipments.length === 0 && (
            <p className="text-sm text-[var(--color-text-faint)]">Activity will appear here as shipments progress.</p>
          )}
        </div>
      </div>

      {/* Slide-over detail panel */}
      <ShipmentPanel
        shipmentId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
