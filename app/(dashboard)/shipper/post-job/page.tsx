'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { shipmentApi } from '@/lib/api';

const schema = z.object({
  item_name:             z.string().min(2, 'Item name required'),
  weight_lbs:            z.coerce.number().positive('Enter a valid weight'),
  dimensions:            z.string().optional(),
  special_notes:         z.string().optional(),
  pickup_address:        z.string().min(5, 'Pickup address required'),
  delivery_address:      z.string().min(5, 'Delivery address required'),
  preferred_pickup_date: z.string().min(1, 'Select a pickup date'),
  budget_min:            z.coerce.number().positive(),
  budget_max:            z.coerce.number().positive(),
});
type FormData = z.infer<typeof schema>;

const STEPS = ['Item Details', 'Addresses', 'Dates & Budget', 'Review'];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-colors';

export default function PostJobPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const values = watch();

  async function onSubmit(data: FormData) {
    try {
      await shipmentApi.create(data);
      toast.success('Job posted! Carriers will start bidding soon.');
      router.push('/shipper/shipments');
    } catch {
      toast.error('Failed to post job. Please try again.');
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="page-title">Post a Freight Job</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < step ? 'bg-[var(--color-teal)] text-white' : i === step ? 'bg-[var(--color-slate)] text-white' : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)]'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <p className={`mt-1 text-xs font-medium ${i === step ? 'text-[var(--color-text)]' : 'text-[var(--color-text-faint)]'}`}>{label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-[2px] flex-1 mx-2 mb-3 ${i < step ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-cream-dark)]'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-5">

          {/* Step 0: Item Details */}
          {step === 0 && (
            <>
              <Field label="Item Name" error={errors.item_name?.message}>
                <input className={inputCls} placeholder="e.g. Grandfather Clock" {...register('item_name')} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Weight (lbs)" error={errors.weight_lbs?.message}>
                  <input type="number" className={inputCls} placeholder="150" {...register('weight_lbs')} />
                </Field>
                <Field label="Dimensions (optional)">
                  <input className={inputCls} placeholder='24" x 12" x 48"' {...register('dimensions')} />
                </Field>
              </div>
              <Field label="Special Handling Notes (optional)">
                <textarea rows={3} className={inputCls} placeholder="Fragile, keep upright, temperature sensitive…" {...register('special_notes')} />
              </Field>
            </>
          )}

          {/* Step 1: Addresses */}
          {step === 1 && (
            <>
              <Field label="Pickup Address" error={errors.pickup_address?.message}>
                <input className={inputCls} placeholder="1234 Industrial Blvd, Denver, CO 80205" {...register('pickup_address')} />
              </Field>
              <Field label="Delivery Address" error={errors.delivery_address?.message}>
                <input className={inputCls} placeholder="5678 Commerce St, Dallas, TX 75201" {...register('delivery_address')} />
              </Field>
            </>
          )}

          {/* Step 2: Dates & Budget */}
          {step === 2 && (
            <>
              <Field label="Preferred Pickup Date" error={errors.preferred_pickup_date?.message}>
                <input type="date" className={inputCls} {...register('preferred_pickup_date')} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Budget Min ($)" error={errors.budget_min?.message}>
                  <input type="number" className={inputCls} placeholder="500" {...register('budget_min')} />
                </Field>
                <Field label="Budget Max ($)" error={errors.budget_max?.message}>
                  <input type="number" className={inputCls} placeholder="1200" {...register('budget_max')} />
                </Field>
              </div>
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-3 text-sm">
              <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)]">Review your job</p>
              {[
                ['Item', values.item_name],
                ['Weight', values.weight_lbs ? `${values.weight_lbs} lbs` : ''],
                ['Pickup', values.pickup_address],
                ['Delivery', values.delivery_address],
                ['Preferred Pickup', values.preferred_pickup_date],
                ['Budget', values.budget_min && values.budget_max ? `$${values.budget_min} – $${values.budget_max}` : ''],
              ].map(([label, val]) => val ? (
                <div key={label} className="flex justify-between border-b border-[var(--color-cream-dark)] pb-2">
                  <span className="text-[var(--color-text-muted)]">{label}</span>
                  <span className="font-medium text-[var(--color-text)] text-right max-w-xs">{val}</span>
                </div>
              ) : null)}
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex justify-between mt-5">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] disabled:opacity-40 transition-colors"
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-lg bg-[var(--color-slate)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-slate-80)] transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[var(--color-teal)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Publishing…' : 'Publish Job'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
