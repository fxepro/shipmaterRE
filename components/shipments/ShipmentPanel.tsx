'use client';

import { useEffect } from 'react';
import { X, MapPin, Truck, User, Package, DollarSign, Clock, Hash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shipmentApi } from '@/lib/api';
import { StatusPill } from './StatusPill';
import { StaticRouteMap } from '@/components/maps/StaticRouteMap';
import type { Shipment } from '@/types/shipment';

interface ShipmentPanelProps {
  shipmentId: number | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-6 py-2.5 border-b border-[var(--color-cream-dark)] last:border-0">
      <span className="text-sm text-[var(--color-text-faint)] shrink-0 w-36">{label}</span>
      <span className="text-sm font-medium text-[var(--color-text)] text-right">{value}</span>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-[var(--color-teal)]" />
        <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">{title}</p>
      </div>
      {children}
    </div>
  );
}

export function ShipmentPanel({ shipmentId, onClose }: ShipmentPanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const { data, isLoading } = useQuery({
    queryKey: ['shipment', shipmentId],
    queryFn: () => shipmentApi.get(shipmentId!),
    enabled: shipmentId !== null,
  });

  const s: Shipment | undefined = data?.data?.data;
  const isOpen = shipmentId !== null;

  const mapPickup   = s?.pickup_lat   && s?.pickup_lng   ? { lat: s.pickup_lat,   lng: s.pickup_lng   } : null;
  const mapDelivery = s?.delivery_lat && s?.delivery_lng ? { lat: s.delivery_lat, lng: s.delivery_lng } : null;

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const formatCost = (n?: number | null) =>
    n != null ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null;
  const formatDist = (miles?: number | null, mins?: number | null) => {
    if (!miles) return null;
    const h = mins ? Math.floor(mins / 60) : null;
    const m = mins ? mins % 60 : null;
    return `${miles.toLocaleString()} mi${h != null ? ` · ${h}h ${m}m` : ''}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel — 50% width */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-1/2 min-w-[520px] bg-[var(--color-cream)] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-cream-dark)] bg-[var(--color-white)] px-6 py-5">
          {isLoading || !s ? (
            <div className="space-y-2">
              <div className="h-5 w-56 rounded bg-[var(--color-cream-dark)] animate-pulse" />
              <div className="h-4 w-32 rounded bg-[var(--color-cream-dark)] animate-pulse" />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-[var(--color-text)]">{s.item_description}</h2>
                <StatusPill status={s.status} />
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-[var(--color-text-faint)]">
                <Hash size={12} />
                <span className="font-mono">{s.tracking_token}</span>
                {s.item_category && (
                  <><span className="opacity-40">·</span><span>{s.item_category}</span></>
                )}
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-[var(--color-text-faint)] hover:bg-[var(--color-cream)] hover:text-[var(--color-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {isLoading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-[var(--color-cream-dark)] animate-pulse" />
              ))}
            </div>
          )}

          {s && (
            <>
              {/* Map */}
              {(mapPickup && mapDelivery) && (
                <div className="h-[260px] rounded-xl overflow-hidden border border-[var(--color-cream-dark)]">
                  <StaticRouteMap pickup={mapPickup} delivery={mapDelivery} />
                </div>
              )}

              {/* Route */}
              <Section icon={MapPin} title="Route">
                <Row label="Pickup address"    value={s.pickup_address} />
                <Row label="Pickup date"       value={formatDate(s.pickup_date)} />
                <Row label="Pickup window"     value={s.pickup_time_window} />
                <Row label="Delivery address"  value={s.delivery_address} />
                <Row label="Delivery date"     value={formatDate(s.delivery_date)} />
                <Row label="Delivery window"   value={s.delivery_time_window} />
                <Row label="Distance"          value={formatDist(s.distance_miles, s.estimated_duration_mins)} />
              </Section>

              {/* Carrier */}
              {s.carrier && (
                <Section icon={Truck} title="Carrier">
                  <Row label="Name"       value={s.carrier.name} />
                  <Row label="Company"    value={s.carrier.carrier_profile?.company_name} />
                  <Row label="DOT #"      value={s.carrier.carrier_profile?.dot_number} />
                  <Row label="Rating"     value={s.carrier.carrier_profile?.rating ? `${s.carrier.carrier_profile.rating} ★` : null} />
                </Section>
              )}

              {/* Shipper */}
              {s.shipper && (
                <Section icon={User} title="Shipper">
                  <Row label="Name"  value={s.shipper.name} />
                  <Row label="Email" value={s.shipper.email} />
                </Section>
              )}

              {/* Item details */}
              <Section icon={Package} title="Item Details">
                <Row label="Description" value={s.item_description} />
                <Row label="Category"    value={s.item_category} />
                <Row label="Weight"      value={s.weight_lbs ? `${s.weight_lbs} lbs` : null} />
                <Row label="Handling"    value={s.handling_requirements?.join(', ')} />
                <Row label="Notes"       value={s.special_notes} />
              </Section>

              {/* Cost */}
              <Section icon={DollarSign} title="Cost">
                <Row label="Agreed cost" value={formatCost(s.agreed_cost)} />
              </Section>

              {/* GPS */}
              {s.latest_ping && (
                <Section icon={Clock} title="Last Known Location">
                  <Row label="Coordinates" value={`${s.latest_ping.lat.toFixed(4)}, ${s.latest_ping.lng.toFixed(4)}`} />
                  <Row label="Speed"       value={s.latest_ping.speed ? `${s.latest_ping.speed} mph` : null} />
                  <Row label="ETA"         value={s.latest_ping.eta} />
                  <Row label="Updated"     value={new Date(s.latest_ping.pinged_at).toLocaleString()} />
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
