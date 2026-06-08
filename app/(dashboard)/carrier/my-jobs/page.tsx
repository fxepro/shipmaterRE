'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Truck, MapPin, ArrowRight, PlayCircle,
  CheckCircle2, Loader2, Navigation, NavigationOff, Signal,
} from 'lucide-react';
import { toast } from 'sonner';
import { shipmentApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusPill } from '@/components/shipments/StatusPill';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Shipment } from '@/types/shipment';
import { useGpsTracker } from '@/hooks/useGpsTracker';

type Filter = 'all' | 'upcoming' | 'today';

const today = new Date().toISOString().slice(0, 10);

function filterJobs(jobs: Shipment[], f: Filter): Shipment[] {
  if (f === 'all') return jobs;
  if (f === 'upcoming') return jobs.filter((j) => j.pickup_date && j.pickup_date > today);
  if (f === 'today')    return jobs.filter((j) => j.pickup_date === today);
  return jobs;
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ago`;
}

// ─── Per-job card (needs its own hook instance) ─────────────────────────────

interface JobCardProps {
  job: Shipment;
  onStart:       (id: number) => void;
  onDeliver:     (id: number) => void;
  startPending:  boolean;
  deliverPending: boolean;
}

function JobCard({ job, onStart, onDeliver, startPending, deliverPending }: JobCardProps) {
  const isInTransit = job.status === 'in_transit';

  const { state, lastPingedAt, error, start, stop } = useGpsTracker({
    shipmentId: job.id,
    enabled:    isInTransit,
  });

  const gpsActive   = state === 'active';
  const gpsAcquiring = state === 'acquiring';
  const gpsError    = state === 'error';

  return (
    <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-5 py-4 space-y-3">

      {/* Top row: info + status */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="font-medium text-[var(--color-text)] truncate">{job.item_description}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <span>{job.pickup_city}, {job.pickup_state}</span>
            <ArrowRight size={10} className="text-[var(--color-text-faint)]" />
            <span>{job.delivery_city}, {job.delivery_state}</span>
            {job.distance_miles && (
              <span className="text-[var(--color-text-faint)]">· {job.distance_miles.toFixed(0)} mi</span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--color-text-faint)]">
            {job.pickup_date && <span>Pickup: {formatDate(job.pickup_date)}</span>}
            {job.agreed_cost && (
              <span className="font-medium text-[var(--color-text-muted)]">{formatCurrency(job.agreed_cost)}</span>
            )}
          </div>
        </div>
        <StatusPill status={job.status} />
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Assigned → Start Job */}
        {job.status === 'assigned' && (
          <button
            onClick={() => onStart(job.id)}
            disabled={startPending}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-teal)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
          >
            {startPending ? <Loader2 size={11} className="animate-spin" /> : <PlayCircle size={11} />}
            Start Job
          </button>
        )}

        {/* In Transit → GPS toggle + Mark Delivered */}
        {isInTransit && (
          <>
            {/* GPS toggle button */}
            <button
              onClick={gpsActive || gpsAcquiring ? stop : start}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                gpsActive
                  ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-light)]'
                  : gpsError
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200'
                    : 'bg-[var(--color-slate)] text-white hover:bg-[var(--color-slate-80)]'
              }`}
            >
              {gpsAcquiring ? (
                <Loader2 size={11} className="animate-spin" />
              ) : gpsActive ? (
                <NavigationOff size={11} />
              ) : (
                <Navigation size={11} />
              )}
              {gpsAcquiring ? 'Acquiring…' : gpsActive ? 'Stop GPS' : gpsError ? 'Retry GPS' : 'Track GPS'}
            </button>

            {/* Mark Delivered */}
            <button
              onClick={() => {
                if (confirm('Confirm delivery? This cannot be undone.')) {
                  onDeliver(job.id);
                }
              }}
              disabled={deliverPending}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              {deliverPending ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
              Mark Delivered
            </button>

            {/* GPS active status strip */}
            {gpsActive && (
              <div className="flex items-center gap-1.5 rounded-lg bg-[var(--color-teal-pale)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-teal)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-teal)] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-teal)]" />
                </span>
                <Signal size={10} />
                GPS Active
                {lastPingedAt && (
                  <span className="text-[var(--color-teal)]/70 font-normal">· {timeAgo(lastPingedAt)}</span>
                )}
              </div>
            )}

            {/* Acquiring status strip */}
            {gpsAcquiring && (
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-600">
                <Loader2 size={10} className="animate-spin" />
                Getting location…
              </div>
            )}

            {/* Error message */}
            {gpsError && error && (
              <p className="w-full text-xs text-red-500 mt-0.5">{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CarrierMyJobsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['carrier-my-jobs'],
    queryFn: () => shipmentApi.list({ phase: 'jobs' }),
  });

  const startMutation = useMutation({
    mutationFn: (id: number) => shipmentApi.start(id),
    onSuccess: () => {
      toast.success('Job started — now showing in My Shipments.');
      qc.invalidateQueries({ queryKey: ['carrier-my-jobs'] });
    },
    onError: () => toast.error('Failed to start job.'),
  });

  const deliverMutation = useMutation({
    mutationFn: (id: number) => shipmentApi.deliver(id),
    onSuccess: () => {
      toast.success('Delivery confirmed!');
      qc.invalidateQueries({ queryKey: ['carrier-my-jobs'] });
    },
    onError: () => toast.error('Failed to confirm delivery.'),
  });

  const allJobs: Shipment[] = res?.data?.data ?? [];
  const jobs = filterJobs(allJobs, filter);

  const filterCls = (f: Filter) =>
    f === filter
      ? 'bg-[var(--color-teal)] text-white'
      : 'bg-[var(--color-cream)] text-[var(--color-text-muted)] hover:bg-[var(--color-cream-dark)] border border-[var(--color-cream-dark)]';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
          My Jobs
        </h1>
        <div className="flex gap-2">
          {(['all', 'upcoming', 'today'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filterCls(f)}`}
            >
              {f === 'today' ? 'Starting Today' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[var(--color-cream)] animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={
            filter === 'all'
              ? 'No accepted jobs'
              : filter === 'today'
                ? 'No jobs starting today'
                : 'No upcoming jobs'
          }
          description="Accepted jobs waiting to start will appear here."
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onStart={(id) => startMutation.mutate(id)}
              onDeliver={(id) => deliverMutation.mutate(id)}
              startPending={startMutation.isPending && startMutation.variables === job.id}
              deliverPending={deliverMutation.isPending && deliverMutation.variables === job.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
