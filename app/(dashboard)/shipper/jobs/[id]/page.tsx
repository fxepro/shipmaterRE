'use client';

import { use } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { freightJobApi } from '@/lib/api';
import { JobView } from '@/components/jobs/JobView';

export default function ShipperJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const jobId  = Number(id);
  const qc     = useQueryClient();

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ['shipper-job', jobId],
    queryFn:  () => freightJobApi.get(jobId),
    enabled:  !!jobId,
  });

  const job = res?.data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-xl bg-[var(--color-cream)] animate-pulse" />
        <div className="h-64 rounded-2xl bg-[var(--color-cream)] animate-pulse" />
        <div className="h-48 rounded-2xl bg-[var(--color-cream)] animate-pulse" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
        <AlertCircle size={16} /> Job not found or you don't have access.
      </div>
    );
  }

  const isContracted = !!job.contract_id;

  return (
    <JobView
      job={job}
      role="shipper"
      backHref={isContracted ? '/shipper/jobs/contracted' : '/shipper/jobs'}
      backLabel={isContracted ? 'Contracted Jobs' : 'My Jobs'}
      onStopUpdated={() => qc.invalidateQueries({ queryKey: ['shipper-job', jobId] })}
    />
  );
}
