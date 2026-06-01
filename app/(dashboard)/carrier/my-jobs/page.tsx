'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, MapPin, ArrowRight, PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { shipmentApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusPill } from '@/components/shipments/StatusPill';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Shipment } from '@/types/shipment';

type Filter = 'all' | 'upcoming' | 'today';

const today = new Date().toISOString().slice(0, 10);

function filterJobs(jobs: Shipment[], f: Filter): Shipment[] {
  if (f === 'all') return jobs;
  if (f === 'upcoming') return jobs.filter((j) => j.pickup_date && j.pickup_date > today);
  if (f === 'today')    return jobs.filter((j) => j.pickup_date === today);
  return jobs;
}

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

  const allJobs: Shipment[] = res?.data?.data ?? [];
  const jobs = filterJobs(allJobs, filter);

  const filterCls = (f: Filter) =>
    f === filter
      ? 'bg-[var(--color-teal)] text-white'
      : 'bg-[var(--color-cream)] text-[var(--color-text-muted)] hover:bg-[var(--color-cream-dark)] border border-[var(--color-cream-dark)]';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>My Jobs</h1>
        <div className="flex gap-2">
          {(['all', 'upcoming', 'today'] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filterCls(f)}`}>
              {f === 'today' ? 'Starting Today' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-[var(--color-cream)] animate-pulse" />)}</div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Truck} title={filter === 'all' ? 'No accepted jobs' : `No ${filter === 'today' ? 'jobs starting today' : 'upcoming jobs'}`} description="Accepted jobs waiting to start will appear here." />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-5 py-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-text)] truncate">{job.item_description}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <span>{job.pickup_city}, {job.pickup_state}</span>
                    <ArrowRight size={10} className="text-[var(--color-text-faint)]" />
                    <span>{job.delivery_city}, {job.delivery_state}</span>
                    {job.distance_miles && <span className="text-[var(--color-text-faint)]">· {job.distance_miles.toFixed(0)} mi</span>}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--color-text-faint)]">
                    {job.pickup_date && <span>Pickup: {formatDate(job.pickup_date)}</span>}
                    {job.agreed_cost && <span className="font-medium text-[var(--color-text-muted)]">{formatCurrency(job.agreed_cost)}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={job.status} />
                  {job.status === 'assigned' && (
                    <button
                      onClick={() => startMutation.mutate(job.id)}
                      disabled={startMutation.isPending}
                      className="flex items-center gap-1.5 rounded-lg bg-[var(--color-teal)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
                    >
                      {startMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <PlayCircle size={11} />}
                      Start Job
                    </button>
                  )}
                  {job.status === 'in_transit' && (
                    <button
                      onClick={() => {
                        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
                        navigator.geolocation.watchPosition(
                          (pos) => shipmentApi.ping(job.id, { lat: pos.coords.latitude, lng: pos.coords.longitude }),
                          () => toast.error('Unable to get location'),
                          { enableHighAccuracy: true, maximumAge: 10_000 }
                        );
                        toast.success('GPS tracking active');
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-[var(--color-slate)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-slate-80)] transition-colors"
                    >
                      <MapPin size={11} />
                      Ping GPS
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
