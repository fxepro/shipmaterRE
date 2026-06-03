import type { Metadata } from 'next';
import {
  Globe, FileText, MapPin, Route, Users, Gavel,
  ClipboardList, CreditCard, Camera, ShieldCheck,
  Bell, Truck, BarChart2, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Features' };

const FEATURES = [
  {
    icon: Globe,
    title: 'Open Market Bidding',
    description: 'Post freight jobs to every verified carrier on the platform. Carriers compete — you pick the best price, timeline, and reputation.',
  },
  {
    icon: FileText,
    title: 'Contracted Carriers',
    description: 'Lock in rates with trusted carriers under per-mile, flat, or per-load contracts. Direct dispatch with zero bidding friction.',
  },
  {
    icon: MapPin,
    title: 'Real-Time GPS Tracking',
    description: 'Live carrier position on an interactive map. Route polyline, ETA, and every ping stored — shipper and receiver both see it.',
  },
  {
    icon: Route,
    title: 'Smart Route Planning',
    description: 'OSRM-powered real-road routing calculates accurate distance and drive time before a job is even posted.',
  },
  {
    icon: Users,
    title: 'Multi-Role Access',
    description: 'Separate dashboards for shippers, carriers, receivers, and admins. Each role sees exactly what it needs and nothing it doesn\'t.',
  },
  {
    icon: Gavel,
    title: 'Bid Management',
    description: 'Carriers place, withdraw, and update bids. Shippers accept in one tap. Rejected bids are automatically notified.',
  },
  {
    icon: ClipboardList,
    title: 'Contract Management',
    description: 'Create, activate, and manage carrier contracts with custom rate types. Contracted jobs skip the market entirely.',
  },
  {
    icon: CreditCard,
    title: 'Escrow Payments',
    description: 'Funds are held in escrow on job assignment and released automatically on delivery confirmation. Stripe-powered, dispute-protected.',
  },
  {
    icon: Camera,
    title: 'Proof of Delivery',
    description: 'Carriers upload delivery photos at drop-off. Timestamped, GPS-tagged, and permanently attached to the shipment record.',
  },
  {
    icon: ShieldCheck,
    title: 'Carrier Verification',
    description: 'DOT number, MC authority, and insurance verification built in. Run background checks before a carrier touches your freight.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Granular email and SMS alerts for every shipment event — assignment, pickup, GPS updates, delivery, and disputes.',
  },
  {
    icon: BarChart2,
    title: 'Admin Console',
    description: 'Full platform visibility. Monitor all shipments, manage users, review disputes, and track platform revenue in one dashboard.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-[var(--color-cream)]">

      {/* Hero */}
      <div className="bg-[var(--color-slate)] text-white px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sage-light)] mb-4">Platform</p>
        <h1 className="text-5xl md:text-6xl text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Everything freight needs.<br />Nothing it doesn't.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--color-sage-light)] leading-relaxed">
          Shipmater is built for the full lifecycle — from job posting and carrier selection through live tracking, proof of delivery, and payment. One platform, every role covered.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-teal-light)] transition-colors"
          >
            Get started free <ArrowRight size={15} />
          </Link>
          <Link
            href="/industries"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-sage-light)]/30 px-6 py-3 text-sm font-semibold text-[var(--color-sage-light)] hover:border-white hover:text-white transition-colors"
          >
            See industries
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-teal-pale)]">
                <Icon size={18} className="text-[var(--color-teal)]" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[var(--color-slate)]">{title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[var(--color-cream-dark)] bg-[var(--color-white)] px-6 py-20 text-center">
        <h2 className="text-3xl text-[var(--color-slate)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Ready to ship smarter?
        </h2>
        <p className="mx-auto max-w-xl text-[var(--color-text-muted)] mb-8">
          Create your account in under two minutes. No credit card required to get started.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-light)] transition-colors"
        >
          Create free account <ArrowRight size={15} />
        </Link>
      </div>

    </div>
  );
}
