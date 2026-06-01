'use client';

import { ArrowRight } from 'lucide-react';
import type { Shipment } from '@/types/shipment';
import { StatusPill } from './StatusPill';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ShipmentTableProps {
  shipments: Shipment[];
  onView?: (id: number) => void;
}

export function ShipmentTable({ shipments, onView }: ShipmentTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-cream-dark)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-cream-dark)] bg-[var(--color-slate)]">
            {['Item', 'Route', 'Carrier', 'Status', 'Date', 'Cost', ''].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-sage-light)] first:rounded-tl-xl last:rounded-tr-xl">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shipments.map((s, i) => (
            <tr
              key={s.id}
              className={`border-b border-[var(--color-cream-dark)] bg-[var(--color-white)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer ${i === shipments.length - 1 ? 'border-b-0' : ''}`}
              onClick={() => onView?.(s.id)}
            >
              <td className="px-4 py-3 font-medium text-[var(--color-text)]">{s.item_description}</td>
              <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  {s.pickup_city ?? '—'}
                  <ArrowRight size={11} className="text-[var(--color-text-faint)]" />
                  {s.delivery_city ?? '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">{s.carrier?.name ?? '—'}</td>
              <td className="px-4 py-3"><StatusPill status={s.status} /></td>
              <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                {s.delivery_date ? formatDate(s.delivery_date) : '—'}
              </td>
              <td className="px-4 py-3 text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
                {s.agreed_cost ? formatCurrency(s.agreed_cost) : '—'}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onView?.(s.id); }}
                  className="text-[var(--color-teal)] text-xs font-medium hover:underline"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
