'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Briefcase, Star } from 'lucide-react';
import { jobApi, carrierApi } from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusPill } from '@/components/shipments/StatusPill';
import { formatCurrency } from '@/lib/utils';

function SkeletonCard() {
  return <div className="skeleton h-[104px] rounded-xl" />;
}

export default function CarrierDashboard() {
  const { data: jobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ['carrier-jobs'],
    queryFn: () => jobApi.list({ limit: 5 }),
  });
  const { data: earningsRes } = useQuery({
    queryKey: ['carrier-earnings'],
    queryFn: () => carrierApi.earnings(),
  });

  const jobs = jobsRes?.data?.data ?? [];
  const earnings = earningsRes?.data?.data;

  const stats = [
    { label: 'Active Jobs',          value: jobs.filter((j: { status: string }) => j.status === 'in_transit').length },
    { label: 'Earnings This Month',  value: earnings?.month_total ?? 0, currency: true, accentColor: 'var(--color-sage)' },
    { label: 'Total Delivered',      value: earnings?.total_deliveries ?? 0, accentColor: 'var(--color-success)' },
    { label: 'Rating',               value: earnings?.rating ? `${earnings.rating.toFixed(1)} ★` : '—', accentColor: 'var(--color-teal)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h1>
        <Link href="/carrier/jobs" className="rounded-lg bg-[var(--color-teal)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] transition-colors">
          Browse Jobs
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {jobsLoading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Open Jobs preview */}
      <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-cream-dark)]">
          <p className="font-medium text-[var(--color-text)]">Open Jobs Near You</p>
          <Link href="/carrier/jobs" className="text-sm font-medium text-[var(--color-teal)] hover:underline">View all</Link>
        </div>
        {jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No open jobs" description="Check back soon for new freight jobs." />
        ) : (
          <div className="divide-y divide-[var(--color-cream-dark)]">
            {jobs.slice(0, 5).map((job: {
              id: number; item_name: string; pickup_city: string; pickup_state: string;
              delivery_city: string; delivery_state: string; weight_lbs: number; status: string;
              budget_min?: number; budget_max?: number;
            }) => (
              <div key={job.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{job.item_name}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{job.pickup_city}, {job.pickup_state} → {job.delivery_city}, {job.delivery_state} · {job.weight_lbs} lbs</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
                    {job.budget_max ? formatCurrency(job.budget_max) : '—'}
                  </p>
                  <StatusPill status={job.status as never} />
                  <Link href={`/carrier/jobs`} className="rounded-lg bg-[var(--color-teal)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] transition-colors">
                    Bid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout card */}
      <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
        <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-4">Payout Summary</p>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-[var(--color-text-faint)] uppercase tracking-wide">In Escrow</p>
            <p className="mt-1 text-2xl text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
              {formatCurrency(earnings?.escrow ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-faint)] uppercase tracking-wide">Available</p>
            <p className="mt-1 text-2xl text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
              {formatCurrency(earnings?.available ?? 0)}
            </p>
          </div>
        </div>
        <Link href="/carrier/earnings" className="mt-4 block w-full rounded-lg border border-[var(--color-teal)] py-2.5 text-center text-sm font-medium text-[var(--color-teal)] hover:bg-[var(--color-teal-pale)] transition-colors">
          Request Payout
        </Link>
      </div>
    </div>
  );
}
