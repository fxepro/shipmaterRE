import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Briefcase, DollarSign, MapPin, ShieldCheck, Star,
  Zap, CheckCircle2, ArrowRight, Truck, Clock,
  FileText, Users, BarChart2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'For Carriers — Shipmater',
  description: 'Find freight jobs that match your service types. Bid, get hired, deliver, get paid.',
};

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Build your profile',
    description: 'Set your service types, upload your certifications, add your vehicles, and verify your DOT and insurance. Your profile is your reputation on the platform.',
  },
  {
    step: '02',
    title: 'Browse matching jobs',
    description: 'The job board shows loads that match your service types first. Filter by location, distance, or use open market to browse everything.',
  },
  {
    step: '03',
    title: 'Bid or get direct offers',
    description: 'Place a bid with your price and timeline on open market jobs. Or get direct offers from shippers with contracted carrier pools.',
  },
  {
    step: '04',
    title: 'Deliver and get paid',
    description: 'Complete the delivery, confirm with a photo, and funds are released from escrow automatically. No chasing invoices.',
  },
];

const FEATURES = [
  {
    icon: Briefcase,
    title: 'Jobs that match you',
    description: 'Set your service types once. The job board filters automatically — medical couriers see medical jobs, freight carriers see freight. No irrelevant listings.',
  },
  {
    icon: DollarSign,
    title: 'Fast escrow payouts',
    description: 'Shipper funds are held in escrow from the moment you\'re assigned. Released automatically on delivery — no payment delays or invoice follow-ups.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified platform',
    description: 'Every shipper on the platform is verified. No fraudulent jobs, no payment risk. Escrow protects both sides of every transaction.',
  },
  {
    icon: FileText,
    title: 'Digital compliance profile',
    description: 'Store your DOT, MC, CDL, certifications, and insurance in your profile. Shippers see exactly what you\'re qualified for before they contact you.',
  },
  {
    icon: Star,
    title: 'Build your reputation',
    description: 'Every delivery builds your rating. Highly-rated carriers get more visibility in shipper searches and more direct offers from contracted networks.',
  },
  {
    icon: Users,
    title: 'Company accounts',
    description: 'Running a fleet? Create a carrier organization, add your drivers, and manage jobs centrally. Company-level DOT, driver-level certifications.',
  },
  {
    icon: MapPin,
    title: 'GPS tracking built in',
    description: 'No separate tracking app. Ping your location directly from the platform. Shippers and receivers see your position live — builds trust and reduces calls.',
  },
  {
    icon: BarChart2,
    title: 'Earnings dashboard',
    description: 'Track completed jobs, pending escrow, and total earnings in one view. Export your history for accounting.',
  },
];

const SERVICE_TYPES = [
  { icon: '🚛', name: 'General Freight' },
  { icon: '⚡', name: 'Hotshot' },
  { icon: '🏥', name: 'Medical Courier' },
  { icon: '💊', name: 'Pharmaceutical' },
  { icon: '🚗', name: 'Auto Transport' },
  { icon: '🏗️', name: 'Heavy Equipment' },
  { icon: '❄️', name: 'Refrigerated' },
  { icon: '☣️', name: 'Hazardous Materials' },
  { icon: '🤍', name: 'White Glove' },
  { icon: '📦', name: 'Last Mile' },
  { icon: '🏠', name: 'Household' },
  { icon: '🎨', name: 'Art & Specialty' },
];

export default function CarriersPage() {
  return (
    <div className="bg-[var(--color-cream)]">

      {/* Hero */}
      <div className="bg-[var(--color-slate)] text-white px-6 py-28 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sage-light)] mb-4">For Carriers</p>
        <h1 className="text-5xl md:text-6xl text-white mb-6 max-w-4xl mx-auto leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Freight jobs that<br />match what you haul.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--color-sage-light)] leading-relaxed">
          Set your service types once. Get matched with loads that fit your equipment, certifications, and location. Bid, get hired, deliver, and get paid — all in one platform.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-light)] transition-colors">
            Join as a carrier <ArrowRight size={15} />
          </Link>
          <Link href="/provider-compliance" className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-sage-light)]/30 px-6 py-3.5 text-sm font-semibold text-[var(--color-sage-light)] hover:border-white hover:text-white transition-colors">
            Requirements
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[var(--color-white)] border-b border-[var(--color-cream-dark)] px-6 py-8">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '37+', label: 'Service types available' },
            { value: '$0', label: 'Join fee' },
            { value: '5s', label: 'GPS ping interval' },
            { value: '100%', label: 'Escrow-protected pay' },
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
          From signup to first paycheck
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

      {/* Service types you can list */}
      <div className="bg-[var(--color-white)] border-t border-[var(--color-cream-dark)] px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Truck size={28} className="mx-auto mb-4 text-[var(--color-teal)]" />
          <h2 className="text-3xl text-[var(--color-slate)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            What service types can you list?
          </h2>
          <p className="text-[var(--color-text-muted)] mb-10">Select all that apply to your operation. Jobs only show when they match your selections.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICE_TYPES.map(({ icon, name }) => (
              <div key={name} className="flex items-center gap-2 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-4 py-2.5">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-[var(--color-text-muted)]">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl text-center text-[var(--color-slate)] mb-16" style={{ fontFamily: 'var(--font-display)' }}>
          Built for how carriers actually work
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-teal-pale)]">
                <Icon size={18} className="text-[var(--color-teal)]" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-[var(--color-slate)]">{title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements callout */}
      <div className="bg-[var(--color-white)] border-t border-[var(--color-cream-dark)] px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] p-6">
          <div className="flex items-start gap-4">
            <ShieldCheck size={24} className="text-[var(--color-teal)] shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-[var(--color-slate)] mb-1">What you need to join</p>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-3">
                Requirements depend on the services you offer. At minimum, all carriers need valid commercial auto liability insurance and a clean background check. DOT and MC authority are required for interstate freight and hazmat.
              </p>
              <Link href="/provider-compliance" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-teal)] hover:underline">
                See full requirements by service type <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[var(--color-slate)] text-white px-6 py-20 text-center">
        <Zap size={32} className="mx-auto mb-4 text-[var(--color-teal)]" />
        <h2 className="text-4xl text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Start finding jobs today
        </h2>
        <p className="text-[var(--color-sage-light)] mb-8 max-w-md mx-auto">
          Free to join. No subscription. Take the jobs you want, skip the rest.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-light)] transition-colors">
          Create carrier account <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
