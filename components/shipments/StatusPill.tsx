import type { ShipmentStatus } from '@/types/shipment';

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  pending:    'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)]',
  bidding:    'bg-amber-50 text-amber-700',
  offered:    'bg-purple-50 text-purple-700',
  assigned:   'bg-[var(--color-sage-pale)] text-[var(--color-sage)]',
  in_transit: 'bg-[var(--color-teal-pale)] text-[var(--color-teal)]',
  delivered:  'bg-emerald-50 text-emerald-700',
  disputed:   'bg-red-50 text-red-700',
  cancelled:  'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending:    'Pending',
  bidding:    'Bidding',
  offered:    'Offered',
  assigned:   'Assigned',
  in_transit: 'In Transit',
  delivered:  'Delivered',
  disputed:   'Disputed',
  cancelled:  'Cancelled',
};

export function StatusPill({ status }: { status: ShipmentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
