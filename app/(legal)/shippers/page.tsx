import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Search, ShieldCheck, MapPin, CreditCard, FileText,
  Users, Zap, CheckCircle2, ArrowRight, Package,
  BarChart2, Clock, Building2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'For Shippers — Shipmater',
  description: 'Post freight, find verified carriers, track every shipment live, and pay with escrow protection.',
};

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Post your shipment',
    description: 'Describe what you\'re shipping, select the service type, add pickup and delivery addresses, and set your timeline. Takes under 2 minutes.',
  },
  {
    step: '02',
    title: 'Choose your carrier',
    description: 'Post to the open market and let verified carriers bid, or assign directly from your preferred network. Filter by service type, location, and certifications.',
  },
  {
    step: '03',
    title: 'Track it live',
    description: 'Follow your shipment on a real-time map with live GPS updates. You and your receiver see the same view — pickup confirmed, route shown, ETA live.',
  },
  {
    step: '04',
    title: 'Pay on delivery',
    description: 'Funds are held in escrow when the carrier is assigned. Released automatically on delivery confirmation. Dispute resolution built in.',
  },
];

const FEATURES = [
  {
    icon: Search,
    title: 'Find the right carrier',
    description: 'Search by service type, location radius, certifications, and verification status. Every carrier profile shows their rating, deliveries, and what they transport.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified carriers only',
    description: 'Every carrier on the platform has DOT, MC, and insurance verified. Background checks, certification tracking, and ongoing compliance monitoring.',
  },
  {
    icon: MapPin,
    title: 'Live GPS tracking',
    description: 'Real-time carrier position on a live map. Route polyline, ETA, and every ping stored. Your receiver gets the same view automatically.',
  },
  {
    icon: CreditCard,
    title: 'Escrow payment protection',
    description: 'Funds are held in escrow and only released on delivery confirmation. Full dispute resolution process if something goes wrong.',
  },
  {
    icon: FileText,
    title: 'Contracted carrier lanes',
    description: 'Lock in rates with trusted carriers on recurring lanes. Set per-mile, flat, or per-load rates. Contracted jobs dispatch directly with no bidding friction.',
  },
  {
    icon: Users,
    title: 'Multi-user organization',
    description: 'Invite your team. Dispatchers create and manage shipments. Managers review reporting. Admins control settings and billing. One org, the right access for each person.',
  },
  {
    icon: BarChart2,
    title: 'Full shipment history',
    description: 'Every shipment — active, delivered, or disputed — stays in your account permanently. Export records for your own compliance and accounting.',
  },
  {
    icon: Package,
    title: 'Any freight type',
    description: 'General freight, medical courier, auto transport, hazmat, refrigerated, white glove, last mile, and more. Match the right carrier to every load.',
  },
];

const INDUSTRIES = [
  'Healthcare & Pharma', 'Auto & Dealerships', 'Food & Beverage',
  'Construction & Equipment', 'Retail & E-Commerce', 'Manufacturing',
  'Government & Public Sector', 'Arts & Specialty',
];

export default function ShippersPage() {
  return (
    <div className="bg-[var(--color-cream)]">

      {/* Hero */}
      <div className="bg-[var(--color-slate)] text-white px-6 py-28 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sage-light)] mb-4">For Shippers</p>
        <h1 className="text-5xl md:text-6xl text-white mb-6 max-w-4xl mx-auto leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Ship anything.<br />Track it live.<br />Pay only on delivery.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--color-sage-light)] leading-relaxed">
          Shipmater connects you to a network of verified carriers across every service type — from general freight to medical courier to white glove. Post a job in minutes, track it in real time, and pay with escrow protection.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-light)] transition-colors">
            Start shipping free <ArrowRight size={15} />
          </Link>
          <Link href="/features" className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-sage-light)]/30 px-6 py-3.5 text-sm font-semibold text-[var(--color-sage-light)] hover:border-white hover:text-white transition-colors">
            See all features
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[var(--color-white)] border-b border-[var(--color-cream-dark)] px-6 py-8">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '8', label: 'Service categories' },
            { value: '37+', label: 'Freight types' },
            { value: '100%', label: 'Carrier verification' },
            { value: '5s', label: 'GPS update interval' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="text-3xl text-center text-[var(--color-slate)] mb-16" style={{ fontFamily: 'var(--font-display)' }}>
          From post to delivery in four steps
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(({ step, title, description }) => (
            <div key={step} className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-6">
              <p className="text-3xl font-bold text-[var(--color-teal)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>{step}</p>
              <h3 className="text-base font-semibold text-[var(--color-slate)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-[var(--color-white)] border-t border-[var(--color-cream-dark)] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl text-center text-[var(--color-slate)] mb-16" style={{ fontFamily: 'var(--font-display)' }}>
            Everything a shipper needs
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-[var(--color-cream-dark)] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-teal-pale)]">
                  <Icon size={18} className="text-[var(--color-teal)]" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-[var(--color-slate)]">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industries */}
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <Building2 size={28} className="mx-auto mb-4 text-[var(--color-teal)]" />
        <h2 className="text-2xl font-semibold text-[var(--color-slate)] mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Built for your industry
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {INDUSTRIES.map(i => (
            <span key={i} className="rounded-full border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-2 text-sm text-[var(--color-text-muted)]">
              {i}
            </span>
          ))}
        </div>
        <p className="mt-6 text-sm text-[var(--color-text-muted)]">
          <Link href="/industries" className="text-[var(--color-teal)] hover:underline">See industry-specific features →</Link>
        </p>
      </div>

      {/* Compliance callout */}
      <div className="bg-[var(--color-white)] border-t border-[var(--color-cream-dark)] px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex items-start gap-4">
          <ShieldCheck size={24} className="text-emerald-600 shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-emerald-900 mb-1">HIPAA-aligned for medical shippers</p>
            <p className="text-sm text-emerald-700 leading-relaxed">
              If you ship medical specimens, pharmaceuticals, or healthcare supplies, Shipmater enforces HIPAA-trained carriers, chain-of-custody GPS logging, and contracted-only carrier pools. <Link href="/compliance" className="underline">Read our compliance page</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[var(--color-slate)] text-white px-6 py-20 text-center">
        <Clock size={32} className="mx-auto mb-4 text-[var(--color-teal)]" />
        <h2 className="text-4xl text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Post your first shipment today
        </h2>
        <p className="text-[var(--color-sage-light)] mb-8 max-w-md mx-auto">
          No setup fee. No monthly minimum. Pay only when a carrier is assigned.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-light)] transition-colors">
          Create free shipper account <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
