import type { Metadata } from 'next';
import { Truck, Activity, Car, Package, UtensilsCrossed, Hammer, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Industries' };

const INDUSTRIES = [
  {
    icon: Truck,
    color: 'bg-[var(--color-teal-pale)]',
    iconColor: 'text-[var(--color-teal)]',
    tag: 'Core',
    title: 'Freight & Logistics',
    headline: 'Built for it from day one.',
    description:
      'The platform was designed around freight. Open market bidding, contracted lane rates, live GPS, multi-stop routing, and real-time carrier tracking — every workflow shippers and carriers run daily is already here.',
    bullets: [
      'Open market + contracted dispatch',
      'Real-road route planning with OSRM',
      'Live GPS with ETA updates',
      'Full bid and contract lifecycle',
    ],
  },
  {
    icon: Activity,
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    tag: 'Compliance-ready',
    title: 'Medical & Pharmaceutical',
    headline: 'Chain of custody without a rebuild.',
    description:
      'Contracted carriers enforce approved vendor lists. Custom fields support lot number, temperature log, and handling requirements out of the box. Delivery photo and GPS timestamp create an auditable chain of custody that satisfies most compliance requirements without custom development.',
    bullets: [
      'Cold chain handling requirements',
      'Lot number and temperature log fields',
      'Photo proof + GPS chain of custody',
      'Contracted-only carrier pools',
    ],
  },
  {
    icon: Car,
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    tag: 'Open & contracted',
    title: 'Auto Transport',
    headline: 'VIN to delivery in one flow.',
    description:
      'Both open market and contracted models apply. Carriers bid on single-vehicle moves or fulfil contracted fleet transport. VIN and condition report attach as custom fields. Photo upload at pickup and delivery is already in the platform — condition disputes have evidence.',
    bullets: [
      'VIN and condition report custom fields',
      'Photo capture at pickup and delivery',
      'Open market bidding for one-off moves',
      'Contracted for fleet and dealer networks',
    ],
  },
  {
    icon: Package,
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
    tag: 'High-value',
    title: 'Art, Antiques & Estate Moves',
    headline: 'White glove is a setting, not a rebuild.',
    description:
      'High declared value, white glove handling requirements, and open market bidding are all already in the data model. Post a move, require handling certification, set a minimum carrier rating, and let qualified specialists compete. Delivery photos create the final condition record.',
    bullets: [
      'Declared value and handling requirements',
      'Carrier rating and certification filters',
      'Open market for specialist carriers',
      'Photo condition record at delivery',
    ],
  },
  {
    icon: UtensilsCrossed,
    color: 'bg-orange-50',
    iconColor: 'text-orange-600',
    tag: 'Recurring runs',
    title: 'Food & Beverage Distribution',
    headline: 'Weekly routes, contracted rates.',
    description:
      'Restaurant and distributor routes run on contracted carriers with refrigerated handling requirements. Recurring shipment scheduling means the same Friday delivery to twelve locations dispatches in one action. Cold chain requirements are enforced at the carrier selection stage.',
    bullets: [
      'Contracted carriers for recurring routes',
      'Refrigerated handling enforcement',
      'Batch dispatch for multi-stop runs',
      'Delivery confirmation at each stop',
    ],
  },
  {
    icon: Hammer,
    color: 'bg-slate-100',
    iconColor: 'text-slate-600',
    tag: 'Heavy freight',
    title: 'Construction Equipment',
    headline: 'Flatbed, oversize, open market.',
    description:
      'Heavy and oversize moves are one-off and irregular — open market bidding is the right model. Flatbed and specialised handling requirements narrow the field to qualified carriers. Weight, dimensions, and special notes give carriers everything they need to quote accurately.',
    bullets: [
      'Open market for one-off heavy moves',
      'Flatbed and oversize handling requirements',
      'Weight and dimension fields',
      'Photo documentation at pickup',
    ],
  },
];

export default function IndustriesPage() {
  return (
    <div className="bg-[var(--color-cream)]">

      {/* Hero */}
      <div className="bg-[var(--color-slate)] text-white px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sage-light)] mb-4">Industries</p>
        <h1 className="text-5xl md:text-6xl text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          One platform.<br />Six industries on day one.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--color-sage-light)] leading-relaxed">
          Shipmater wasn't built for a single vertical. The underlying model — jobs, bids, contracts, GPS, proof of delivery — maps cleanly to every industry that moves physical goods.
        </p>
      </div>

      {/* Industry cards */}
      <div className="mx-auto max-w-6xl px-6 py-24 space-y-8">
        {INDUSTRIES.map(({ icon: Icon, color, iconColor, tag, title, headline, description, bullets }) => (
          <div
            key={title}
            className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start">

              {/* Icon + tag */}
              <div className="shrink-0">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
                  <Icon size={24} className={iconColor} />
                </div>
                <span className="mt-3 inline-block rounded-full bg-[var(--color-cream)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)]">
                  {tag}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl text-[var(--color-slate)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {title}
                </h2>
                <p className="text-sm font-semibold text-[var(--color-teal)] mb-3">{headline}</p>
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)] mb-5">{description}</p>

                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-teal-pale)]">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3.5 6L6.5 2" stroke="var(--color-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="border-t border-[var(--color-cream-dark)] bg-[var(--color-white)] px-6 py-20 text-center">
        <h2 className="text-3xl text-[var(--color-slate)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Your industry. Your workflow.
        </h2>
        <p className="mx-auto max-w-xl text-[var(--color-text-muted)] mb-8">
          Get started in minutes. No custom development required.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-light)] transition-colors"
          >
            Create free account <ArrowRight size={15} />
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-cream-dark)] px-8 py-3.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors"
          >
            See all features
          </Link>
        </div>
      </div>

    </div>
  );
}
