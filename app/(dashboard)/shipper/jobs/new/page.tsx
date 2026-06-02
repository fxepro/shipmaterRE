'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { shipmentApi, contractApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  job_type:    z.enum(['open', 'contracted']),
  contract_id: z.coerce.number().optional(),

  item_description: z.string().min(3, 'Required'),
  item_category:    z.string().optional(),
  weight_lbs:       z.coerce.number().positive().optional().or(z.literal('')),
  special_notes:    z.string().optional(),

  pickup_address:  z.string().min(3, 'Required'),
  pickup_city:     z.string().optional(),
  pickup_state:    z.string().optional(),
  pickup_date:     z.string().optional(),
  pickup_time_window: z.string().optional(),

  delivery_address:  z.string().min(3, 'Required'),
  delivery_city:     z.string().optional(),
  delivery_state:    z.string().optional(),
  delivery_date:     z.string().optional(),
  delivery_time_window: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const inputCls = 'w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-colors';
const labelCls = 'block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5';

interface Contract { id: number; carrier_id: number; carrier_name?: string; rate: number; rate_type: string; coverage: string; status: string; }

function toContract(r: any): Contract {
  return {
    id: r.id, carrier_id: r.carrier_id,
    carrier_name: r.carrier_name ?? r.carrier?.name,
    rate: r.rate, rate_type: r.rate_type, coverage: r.coverage, status: r.status,
  };
}

export default function CreateJobPage() {
  const router = useRouter();
  const [jobType, setJobType] = useState<'open' | 'contracted'>('open');

  const { data: contractsRes } = useQuery({
    queryKey: ['active-contracts'],
    queryFn: () => contractApi.list({ status: 'active' }),
    enabled: jobType === 'contracted',
  });

  const activeContracts: Contract[] = (contractsRes?.data?.data ?? []).map(toContract);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { job_type: 'open' },
  });

  const selectedContractId = watch('contract_id');
  const selectedContract = activeContracts.find((c) => c.id === Number(selectedContractId));

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const payload: Record<string, unknown> = {
        ...data,
        job_type: jobType,
        weight_lbs: data.weight_lbs === '' ? undefined : data.weight_lbs,
      };
      if (jobType !== 'contracted') delete payload.contract_id;
      return shipmentApi.create(payload);
    },
    onSuccess: () => {
      toast.success('Job created!');
      router.push('/shipper/jobs');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create job.';
      toast.error(msg);
    },
  });

  function handleTypeSelect(t: 'open' | 'contracted') {
    setJobType(t);
    setValue('job_type', t);
  }

  return (
    <div className="w-[75%] min-w-[560px] space-y-6">
      <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>Create Job</h1>

      {/* Job type selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleTypeSelect('open')}
          className={cn(
            'rounded-xl border-2 p-5 text-left transition-all',
            jobType === 'open'
              ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)]'
              : 'border-[var(--color-cream-dark)] bg-[var(--color-white)] hover:border-[var(--color-teal)]'
          )}
        >
          <Globe size={20} className={jobType === 'open' ? 'text-[var(--color-teal)]' : 'text-[var(--color-text-faint)]'} />
          <p className="mt-2 font-medium text-[var(--color-text)]">Open Market</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Post to all carriers — they bid, you choose the best offer.</p>
        </button>

        <button
          type="button"
          onClick={() => handleTypeSelect('contracted')}
          className={cn(
            'rounded-xl border-2 p-5 text-left transition-all',
            jobType === 'contracted'
              ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)]'
              : 'border-[var(--color-cream-dark)] bg-[var(--color-white)] hover:border-[var(--color-teal)]'
          )}
        >
          <FileText size={20} className={jobType === 'contracted' ? 'text-[var(--color-teal)]' : 'text-[var(--color-text-faint)]'} />
          <p className="mt-2 font-medium text-[var(--color-text)]">Contracted</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Send directly to a carrier under an active contract. No bidding.</p>
        </button>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">

        {/* Contract selector */}
        {jobType === 'contracted' && (
          <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] p-5">
            <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-4">Select Contract</p>
            {activeContracts.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">No active contracts found. <a href="/shipper/contracts" className="text-[var(--color-teal)] hover:underline">Create one first.</a></p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Contract</label>
                  <select className={inputCls} {...register('contract_id', { required: jobType === 'contracted' })}>
                    <option value="">Select a contract…</option>
                    {activeContracts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.carrier_name ?? `Carrier #${c.carrier_id}`} — {c.rate_type} ${c.rate} · {c.coverage}
                      </option>
                    ))}
                  </select>
                  {errors.contract_id && <p className="mt-1 text-xs text-[var(--color-danger)]">Please select a contract.</p>}
                </div>
                {selectedContract && (
                  <div className="rounded-lg bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                    Rate: <span className="font-medium text-[var(--color-text)]">${selectedContract.rate} {selectedContract.rate_type}</span>
                    {' · '}Coverage: <span className="font-medium text-[var(--color-text)]">{selectedContract.coverage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Item */}
        <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] p-5 space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)]">Freight Details</p>
          <div>
            <label className={labelCls}>Description *</label>
            <input className={inputCls} placeholder="Industrial machinery, 3 pallets of electronics…" {...register('item_description')} />
            {errors.item_description && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.item_description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <input className={inputCls} placeholder="Electronics, Machinery…" {...register('item_category')} />
            </div>
            <div>
              <label className={labelCls}>Weight (lbs)</label>
              <input type="number" className={inputCls} placeholder="500" {...register('weight_lbs')} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Special Notes</label>
            <textarea rows={2} className={inputCls} placeholder="Fragile, keep upright…" {...register('special_notes')} />
          </div>
        </div>

        {/* Pickup */}
        <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] p-5 space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)]">Pickup</p>
          <div>
            <label className={labelCls}>Address *</label>
            <input className={inputCls} placeholder="123 Warehouse Blvd, Chicago, IL" {...register('pickup_address')} />
            {errors.pickup_address && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.pickup_address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>City</label>
              <input className={inputCls} placeholder="Chicago" {...register('pickup_city')} />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input className={inputCls} placeholder="IL" {...register('pickup_state')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={inputCls} {...register('pickup_date')} />
            </div>
            <div>
              <label className={labelCls}>Time Window</label>
              <input className={inputCls} placeholder="8am – 12pm" {...register('pickup_time_window')} />
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] p-5 space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)]">Delivery</p>
          <div>
            <label className={labelCls}>Address *</label>
            <input className={inputCls} placeholder="456 Distribution Dr, Dallas, TX" {...register('delivery_address')} />
            {errors.delivery_address && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.delivery_address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>City</label>
              <input className={inputCls} placeholder="Dallas" {...register('delivery_city')} />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input className={inputCls} placeholder="TX" {...register('delivery_state')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={inputCls} {...register('delivery_date')} />
            </div>
            <div>
              <label className={labelCls}>Time Window</label>
              <input className={inputCls} placeholder="2pm – 6pm" {...register('delivery_time_window')} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-[var(--color-cream-dark)] py-3 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[var(--color-teal)] py-3 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
          >
            {(isSubmitting || mutation.isPending) && <Loader2 size={14} className="animate-spin" />}
            {jobType === 'contracted' ? 'Send to Carrier' : 'Post to Market'}
          </button>
        </div>
      </form>
    </div>
  );
}
