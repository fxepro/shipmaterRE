'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Package, ArrowRight, CheckCircle, Clock, Truck } from 'lucide-react';
import { trackApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface TrackingData {
  id: number;
  status: string;
  item_description: string;
  pickup_address: string;
  pickup_city: string;
  pickup_state: string;
  pickup_date: string | null;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_date: string | null;
  carrier_name?: string;
  last_ping?: { lat: number; lng: number; recorded_at: string } | null;
}

const STATUS_STEPS = ['pending', 'assigned', 'in_transit', 'delivered'];

function statusIndex(s: string) {
  const i = STATUS_STEPS.indexOf(s);
  return i === -1 ? 0 : i;
}

export default function PublicTrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ['track', token],
    queryFn: () => trackApi.get(token),
    retry: false,
  });

  const shipment: TrackingData | null = res?.data?.data ?? null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-cream)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-teal)] border-t-transparent" />
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--color-cream)] px-4 text-center">
        <Package size={40} className="text-[var(--color-text-faint)]" />
        <h1 className="text-xl font-semibold text-[var(--color-slate)]">Tracking link not found</h1>
        <p className="text-sm text-[var(--color-text-muted)]">This link may have expired or the shipment doesn&apos;t exist.</p>
      </div>
    );
  }

  const currentStep = statusIndex(shipment.status);

  return (
    <div className="min-h-screen bg-[var(--color-cream)] px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <span className="text-lg font-semibold text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
            Shipmater
          </span>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Live shipment tracking</p>
        </div>

        {/* Item card */}
        <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-teal-pale)]">
              <Package size={18} className="text-[var(--color-teal)]" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[var(--color-text)]">{shipment.item_description}</p>
              {shipment.carrier_name && (
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Carrier: {shipment.carrier_name}</p>
              )}
            </div>
          </div>

          {/* Route */}
          <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-faint)]">From</p>
              <p className="font-medium text-[var(--color-text)] truncate">{shipment.pickup_city}, {shipment.pickup_state}</p>
              {shipment.pickup_date && <p className="text-xs">{formatDate(shipment.pickup_date)}</p>}
            </div>
            <ArrowRight size={16} className="shrink-0 text-[var(--color-text-faint)]" />
            <div className="min-w-0 flex-1 text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-faint)]">To</p>
              <p className="font-medium text-[var(--color-text)] truncate">{shipment.delivery_city}, {shipment.delivery_state}</p>
              {shipment.delivery_date && <p className="text-xs">{formatDate(shipment.delivery_date)}</p>}
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">Status</p>
          <div className="space-y-3">
            {[
              { key: 'pending',   label: 'Order placed',   icon: Clock    },
              { key: 'assigned',  label: 'Carrier assigned', icon: Truck  },
              { key: 'in_transit', label: 'In transit',    icon: MapPin   },
              { key: 'delivered', label: 'Delivered',      icon: CheckCircle },
            ].map(({ key, label, icon: Icon }, i) => {
              const done    = i <= currentStep;
              const current = i === currentStep;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    done
                      ? current
                        ? 'bg-[var(--color-teal)] text-white'
                        : 'bg-emerald-100 text-emerald-600'
                      : 'bg-[var(--color-cream)] text-[var(--color-text-faint)]'
                  }`}>
                    <Icon size={14} />
                  </div>
                  <p className={`text-sm ${done ? 'font-medium text-[var(--color-text)]' : 'text-[var(--color-text-faint)]'}`}>
                    {label}
                  </p>
                  {current && (
                    <span className="ml-auto rounded-full bg-[var(--color-teal-pale)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-teal)]">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Last known location */}
        {shipment.last_ping && (
          <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">Last GPS ping</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {shipment.last_ping.lat.toFixed(5)}, {shipment.last_ping.lng.toFixed(5)}
              {' · '}
              <span className="text-[var(--color-text-faint)]">{formatDate(shipment.last_ping.recorded_at)}</span>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-[var(--color-text-faint)]">
          Powered by Shipmater · Updates in real time
        </p>
      </div>
    </div>
  );
}
