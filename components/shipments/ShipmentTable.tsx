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
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
      <table className="data-table">
        <thead>
          <tr>
            {['Item', 'Route', 'Carrier', 'Status', 'Date', 'Cost', ''].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
            <tr key={s.id} className="cursor-pointer" onClick={() => onView?.(s.id)}>
              <td className="font-medium">{s.item_description}</td>
              <td style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1">
                  {s.pickup_city ?? '—'}
                  <ArrowRight size={11} style={{ color: 'var(--text-faint)' }} />
                  {s.delivery_city ?? '—'}
                </span>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>{s.carrier?.name ?? '—'}</td>
              <td><StatusPill status={s.status} /></td>
              <td style={{ color: 'var(--text-muted)' }}>
                {s.delivery_date ? formatDate(s.delivery_date) : '—'}
              </td>
              <td className="font-medium">{s.agreed_cost ? formatCurrency(s.agreed_cost) : '—'}</td>
              <td>
                <button
                  onClick={(e) => { e.stopPropagation(); onView?.(s.id); }}
                  className="link text-xs"
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
