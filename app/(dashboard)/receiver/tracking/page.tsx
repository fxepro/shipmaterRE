'use client';

import { MapPin, Clock, Phone } from 'lucide-react';

const MOCK_ACTIVE = [
  {
    id: 1,
    ref: 'SHP-1042',
    description: 'Medical imaging equipment',
    shipper: 'Denver Regional Hospital',
    carrier: 'Rodriguez Freight',
    carrierPhone: '+1 (720) 555-0182',
    origin: 'Denver, CO',
    destination: 'Dallas, TX',
    status: 'In Transit',
    eta: '14h 22m',
  },
];

export default function ReceiverTrackingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            Live Tracking
          </h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">
            Real-time status of shipments coming your way
          </p>
        </div>
        {MOCK_ACTIVE.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-teal-pale)] px-3 py-1.5 text-sm font-medium text-[var(--color-teal)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal)] animate-pulse" />
            {MOCK_ACTIVE.length} en route
          </div>
        )}
      </div>

      {MOCK_ACTIVE.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-cream-dark)] bg-[var(--color-white)] py-20 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-teal-pale)]">
            <MapPin size={22} className="text-[var(--color-teal)]" />
          </div>
          <p className="font-medium text-[var(--color-text)]">Nothing in transit</p>
          <p className="mt-1 text-sm text-[var(--color-text-faint)]">Live tracking will appear here when a shipment is on its way to you.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {MOCK_ACTIVE.map((s) => (
            <div key={s.id} className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-teal-pale)]">
                    <MapPin size={18} className="text-[var(--color-teal)]" />
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[var(--color-teal)] animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--color-text)]">{s.ref}</span>
                      <span className="rounded-full bg-[var(--color-teal-pale)] px-2 py-0.5 text-xs font-medium text-[var(--color-teal)]">{s.status}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">{s.description}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1 text-xs text-[var(--color-text-faint)]">
                    <Clock size={11} /> ETA
                  </div>
                  <p className="text-lg font-semibold text-[var(--color-slate)]">{s.eta}</p>
                </div>
              </div>

              {/* Route */}
              <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <span className="font-medium">{s.origin}</span>
                <div className="flex-1 border-t border-dashed border-[var(--color-cream-dark)]" />
                <MapPin size={10} className="text-[var(--color-teal)]" />
                <span className="font-medium">{s.destination}</span>
              </div>

              {/* Carrier info */}
              <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--color-cream)] px-3 py-2.5">
                <div>
                  <p className="text-xs text-[var(--color-text-faint)]">Carrier</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{s.carrier}</p>
                  <p className="text-xs text-[var(--color-text-faint)]">From {s.shipper}</p>
                </div>
                <a
                  href={`tel:${s.carrierPhone}`}
                  className="flex items-center gap-1.5 rounded-lg bg-[var(--color-white)] border border-[var(--color-cream-dark)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-teal)] transition-colors"
                >
                  <Phone size={11} className="text-[var(--color-teal)]" />
                  {s.carrierPhone}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-text-faint)]">
        GPS updates every 30 seconds via live WebSocket. Click any shipment to open the full map view.
      </div>
    </div>
  );
}
