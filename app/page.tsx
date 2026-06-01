'use client';

import Link from 'next/link';
import { ArrowRight, Package, Truck, MapPin, ShieldCheck, Zap, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: MapPin,
    title: 'Live GPS Tracking',
    description: 'Watch your freight move in real time. Every ping from the carrier shows up instantly on your map.',
  },
  {
    icon: Truck,
    title: 'Verified Carriers',
    description: 'Every carrier is DOT-verified and background-checked before they can bid on your jobs.',
  },
  {
    icon: DollarSign,
    title: 'Competitive Bidding',
    description: 'Post a job, get bids from multiple carriers, and choose the best price and timeline for you.',
  },
  {
    icon: ShieldCheck,
    title: 'Escrow Protection',
    description: 'Funds are held in escrow until delivery is confirmed. You never pay before the job is done.',
  },
  {
    icon: Zap,
    title: 'Instant Notifications',
    description: 'Get real-time alerts when your carrier crosses a state line, gets delayed, or arrives.',
  },
  {
    icon: Package,
    title: 'Any Freight',
    description: 'From pallets to oversized cargo, Shipmater handles any type of freight job, any distance.',
  },
];

const STATS = [
  { value: '12,400+', label: 'Shipments delivered' },
  { value: '3,200+', label: 'Verified carriers' },
  { value: '98.4%', label: 'On-time delivery' },
  { value: '$0', label: 'Hidden fees' },
];

const ROLES = [
  {
    role: 'Shipper',
    color: 'var(--color-teal)',
    colorPale: 'var(--color-teal-pale)',
    description: 'Post freight jobs, get competitive bids, and track every delivery live.',
    cta: 'Start shipping',
    href: '/register',
  },
  {
    role: 'Carrier',
    color: 'var(--color-slate)',
    colorPale: 'var(--color-cream)',
    description: 'Browse open jobs near you, bid in seconds, and get paid fast.',
    cta: 'Find jobs',
    href: '/register',
  },
  {
    role: 'Receiver',
    color: 'var(--color-sage)',
    colorPale: 'var(--color-sage-pale)',
    description: 'Track incoming deliveries in real time and confirm receipt with one tap.',
    cta: 'Track a delivery',
    href: '/register',
  },
];

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-cream-dark)] bg-[var(--color-cream)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
            Shipmater
          </span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[var(--color-slate)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-slate-80)] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-teal-pale)] px-3 py-1 text-xs font-medium text-[var(--color-teal)] mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal)]" />
            Live freight tracking platform
          </span>

          <h1
            className="mx-auto max-w-3xl text-5xl md:text-6xl leading-tight text-[var(--color-slate)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Freight that moves,{' '}
            <em>tracked in real time</em>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--color-text-muted)]">
            Connect shippers with verified carriers. Post a job, get competitive bids,
            and watch your freight on a live map from pickup to delivery.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] transition-colors"
            >
              Get started free
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-6 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-teal)] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        {/* Mock dashboard preview */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden"
        >
          {/* Fake browser chrome */}
          <div className="flex items-center gap-2 border-b border-[var(--color-cream-dark)] px-4 py-3 bg-[var(--color-cream)]">
            <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-300" />
            <div className="ml-3 flex-1 rounded bg-[var(--color-cream-dark)] px-3 py-1 text-xs text-[var(--color-text-faint)]">
              shipmater.com/shipper
            </div>
          </div>

          {/* Mini dashboard mockup */}
          <div className="flex min-h-[320px]">
            {/* Sidebar */}
            <div className="hidden sm:flex w-[180px] shrink-0 flex-col bg-[var(--color-slate)] p-4 gap-1">
              <p className="text-xs font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Shipmater</p>
              {['Dashboard', 'My Shipments', 'Post a Job', 'Bids'].map((item, i) => (
                <div key={item} className={`rounded-md px-2.5 py-1.5 text-xs ${i === 0 ? 'bg-[var(--color-white)] text-[var(--color-slate)] font-medium' : 'text-[var(--color-sage-light)]'}`}>
                  {item}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</p>
                <div className="rounded-md bg-[var(--color-teal)] px-3 py-1 text-xs font-medium text-white">+ Post a Job</div>
              </div>
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[['Active Shipments', '4'], ['Bids Received', '9'], ['Delivered', '38'], ['Total Spent', '$14,200']].map(([label, val]) => (
                  <div key={label} className="rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-cream)] p-3">
                    <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-faint)]">{label}</p>
                    <p className="mt-1 text-lg text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{val}</p>
                  </div>
                ))}
              </div>
              {/* Map placeholder */}
              <div className="rounded-lg bg-[var(--color-slate)] h-[100px] flex items-center justify-center gap-2 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,var(--color-slate-60)_0px,var(--color-slate-60)_1px,transparent_1px,transparent_8px)]" />
                <MapPin size={14} className="text-[var(--color-teal)]" />
                <span className="text-xs text-[var(--color-sage-light)]">Live GPS Map — Denver, CO → Dallas, TX</span>
                <span className="absolute right-3 top-2 rounded bg-[var(--color-teal)] px-2 py-0.5 text-xs text-white font-medium">ETA 14h 22m</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-[var(--color-slate)] py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <p className="text-3xl text-white" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</p>
                <p className="mt-1 text-xs text-[var(--color-sage-light)]">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-3">Why Shipmater</p>
          <h2 className="text-4xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
            Everything freight needs
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-teal-pale)]">
                <f.icon size={18} className="text-[var(--color-teal)]" />
              </div>
              <h3 className="font-medium text-[var(--color-text)] mb-1">{f.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Role cards */}
      <section className="bg-[var(--color-white)] border-y border-[var(--color-cream-dark)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-3">Built for everyone</p>
            <h2 className="text-4xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
              One platform, three roles
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ROLES.map((r, i) => (
              <motion.div
                key={r.role}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-[var(--color-cream-dark)] p-8 flex flex-col"
                style={{ background: r.colorPale }}
              >
                <p className="text-xs font-medium uppercase tracking-[0.07em] mb-2" style={{ color: r.color }}>{r.role}</p>
                <h3 className="text-2xl text-[var(--color-slate)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>{r.role}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed flex-1">{r.description}</p>
                <Link
                  href={r.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ color: r.color }}
                >
                  {r.cta} <ArrowRight size={13} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="text-5xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to ship smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[var(--color-text-muted)]">
            Join thousands of shippers and carriers already using Shipmater.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-8 py-3.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] transition-colors"
          >
            Create your free account <ArrowRight size={15} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-cream-dark)] py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between flex-wrap gap-4">
          <span className="text-sm text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>Shipmater</span>
          <p className="text-xs text-[var(--color-text-faint)]">© 2026 Shipmater. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-[var(--color-text-faint)]">
            <Link href="/login" className="hover:text-[var(--color-text)]">Sign in</Link>
            <Link href="/register" className="hover:text-[var(--color-text)]">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
