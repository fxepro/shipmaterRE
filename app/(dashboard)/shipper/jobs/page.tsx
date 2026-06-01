'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, ArrowRight, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { shipmentApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusPill } from '@/components/shipments/StatusPill';
import { formatDate } from '@/lib/utils';
import type { Shipment } from '@/types/shipment';

type Filter = 'all' | 'pending' | 'bidding' | 'assigned';

function filterJobs(jobs: Shipment[], f: Filter): Shipment[] {
  if (f === 'all') return jobs;
  return jobs.filter((j) => j.status === f);
}

export default function ShipperMyJobsPage() {
  const [filter, setFilter] = useState<Filter>('all');

  const { data: res, isLoading } = useQuery({
    queryKey: ['shipper-jobs'],
    queryFn: () => shipmentApi.list({ phase: 'jobs' }),
  });

  const allJobs: Shipment[] = res?.data?.data ?? [];
  const jobs = filterJobs(allJobs, filter);

  const counts = {
    all:      allJobs.length,
    pending:  allJobs.filter((j) => j.status === 'pending').length,
    bidding:  allJobs.filter((j) => j.status === 'bidding').length,
    assigned: allJobs.filter((j) => j.status === 'assigned').length,
  };

  const filterCls = (f: Filter) =>
    f === filter
      ? 'bg-[var(--color-teal)] text-white'
      : 'bg-[var(--color-cream)] text-[var(--color-text-muted)] hover:bg-[var(--color-cream-dark)] border border-[var(--color-cream-dark)]';

  const filterLabels: Record<Filter, string> = {
    all:      'All',
    pending:  'Pending',
    bidding:  'Bidding',
    assigned: 'Assigned',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>My Jobs</h1>
        <Link
          href="/shipper/jobs/new"
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] transition-colors"
        >
          <Plus size={14} />
          Create Job
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(filterLabels) as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filterCls(f)}`}>
            {filterLabels[f]}
            {counts[f] > 0 && <span className="ml-1.5 opacity-70">({counts[f]})</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-[var(--color-cream)] animate-pulse" />)}</div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filter === 'all' ? 'No jobs yet' : `No ${filter} jobs`}
          description={filter === 'all' ? 'Create your first job to get started.' : `Jobs in ${filter} status will appear here.`}
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-5 py-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--color-text)] truncate">{job.item_description}</p>
                    {job.job_type === 'contracted' && (
                      <span className="shrink-0 text-xs font-medium bg-purple-50 text-purple-700 rounded-full px-2 py-0.5">Contracted</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <span>{job.pickup_city}, {job.pickup_state}</span>
                    <ArrowRight size={10} className="text-[var(--color-text-faint)]" />
                    <span>{job.delivery_city}, {job.delivery_state}</span>
                    {job.distance_miles && <span className="text-[var(--color-text-faint)]">· {job.distance_miles.toFixed(0)} mi</span>}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--color-text-faint)]">
                    {job.pickup_date && <span>Pickup: {formatDate(job.pickup_date)}</span>}
                    {job.weight_lbs && <span>{job.weight_lbs} lbs</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {job.status === 'bidding' && (
                    <Link
                      href="/shipper/jobs/offers"
                      className="flex items-center gap-1 text-xs font-medium text-[var(--color-teal)] hover:underline"
                    >
                      <Users size={11} />
                      View bids
                    </Link>
                  )}
                  <StatusPill status={job.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
