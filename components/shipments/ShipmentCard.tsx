import { ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import type { Shipment } from '@/types/shipment';
import { StatusPill } from './StatusPill';
import { formatDate } from '@/lib/utils';

interface ShipmentCardProps {
  shipment: Shipment;
  href?: string;
}

export function ShipmentCard({ shipment, href }: ShipmentCardProps) {
  const content = (
    <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 hover:border-[var(--color-teal-light)] transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-cream)]">
            <Package size={16} className="text-[var(--color-text-muted)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">{shipment.item_name}</p>
            <p className="text-xs text-[var(--color-text-faint)]">{shipment.weight_lbs} lbs</p>
          </div>
        </div>
        <StatusPill status={shipment.status} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <span>{shipment.pickup_city}, {shipment.pickup_state}</span>
        <ArrowRight size={12} className="shrink-0 text-[var(--color-text-faint)]" />
        <span>{shipment.delivery_city}, {shipment.delivery_state}</span>
      </div>

      {shipment.eta && (
        <p className="mt-2 text-xs text-[var(--color-text-faint)]">ETA {formatDate(shipment.eta)}</p>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
