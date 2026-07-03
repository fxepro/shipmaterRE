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
    <div className="card card-body transition-colors hover:border-[var(--primary)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="icon-chip">
            <Package size={16} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{shipment.item_description}</p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{shipment.weight_lbs} lbs</p>
          </div>
        </div>
        <StatusPill status={shipment.status} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <span>{shipment.pickup_city}, {shipment.pickup_state}</span>
        <ArrowRight size={12} className="shrink-0" style={{ color: 'var(--text-faint)' }} />
        <span>{shipment.delivery_city}, {shipment.delivery_state}</span>
      </div>

      {shipment.latest_ping?.eta && (
        <p className="mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>ETA {shipment.latest_ping.eta}</p>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
