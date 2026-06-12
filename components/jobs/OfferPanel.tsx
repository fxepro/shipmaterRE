'use client';

/**
 * OfferPanel — slide-in overlay for a carrier to make an offer on an open job.
 * Fields shown are driven entirely by job.quote_requirements set by the shipper.
 * Falls back to a simple flat-amount form if no quote_requirements are set.
 */

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X, DollarSign, MessageSquare, Route, MapPin, Loader2,
  CheckCircle2, Truck, Scale, Clock, Fuel, CreditCard,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { freightJobApi } from '@/lib/api';

function fmt(n: number | string | null | undefined) {
  const v = parseFloat(String(n ?? 0)) || 0;
  return '$' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const PAYMENT_TERMS_OPTIONS = ['Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Factoring', 'QuickPay'];

interface Props {
  job:       any;
  onClose:   () => void;
  onSuccess: () => void;
}

export function OfferPanel({ job, onClose, onSuccess }: Props) {
  const qr        = job.quote_requirements ?? null;
  const rateType  = (qr?.rate_type ?? 'flat') as 'flat' | 'per_mile' | 'hourly';
  const distMiles = job.route_distance_miles ? parseFloat(job.route_distance_miles) : null;
  const estHrs    = job.route_duration_minutes ? job.route_duration_minutes / 60 : null;

  // Rate inputs
  const [rateValue,     setRateValue]     = useState('');
  const [amount,        setAmount]        = useState('');
  // Optional/required fields
  const [fuelSurcharge, setFuelSurcharge] = useState('');
  const [detentionRate, setDetentionRate] = useState('');
  const [freeTimeHrs,   setFreeTimeHrs]   = useState(String(qr?.free_time_hrs ?? 2));
  const [equipmentType, setEquipmentType] = useState('');
  const [maxWeight,     setMaxWeight]     = useState('');
  const [paymentTerms,  setPaymentTerms]  = useState(qr?.payment_terms_hint ?? '');
  const [note,          setNote]          = useState('');
  const [done,          setDone]          = useState(false);

  // Derived numbers
  const rateValueNum = parseFloat(rateValue.replace(/,/g, '')) || 0;
  const amountNum    = parseFloat(amount.replace(/,/g, ''))    || 0;

  const calculatedTotal = useMemo(() => {
    if (rateType === 'per_mile' && rateValueNum > 0 && distMiles) return rateValueNum * distMiles;
    if (rateType === 'hourly'   && rateValueNum > 0 && estHrs)    return rateValueNum * estHrs;
    return null;
  }, [rateType, rateValueNum, distMiles, estHrs]);

  const finalAmount = rateType === 'flat' ? amountNum : (calculatedTotal ?? 0);

  const canSubmit = useMemo(() => {
    if (rateType === 'flat' && amountNum < 1) return false;
    if ((rateType === 'per_mile' || rateType === 'hourly') && rateValueNum < 0.01) return false;
    if (qr?.require_fuel_surcharge  && !fuelSurcharge.trim()) return false;
    if (qr?.require_detention_rate  && !detentionRate.trim()) return false;
    if (qr?.require_equipment_type  && !equipmentType.trim()) return false;
    if (qr?.require_max_weight      && !maxWeight.trim())     return false;
    if (qr?.require_payment_terms   && !paymentTerms.trim())  return false;
    return finalAmount >= 1;
  }, [rateType, amountNum, rateValueNum, qr, fuelSurcharge, detentionRate, equipmentType, maxWeight, paymentTerms, finalAmount]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        rate_type: rateType,
        amount:    finalAmount,
        note:      note.trim() || undefined,
      };
      if (rateType !== 'flat')         payload.rate_value     = rateValueNum;
      if (fuelSurcharge.trim())        payload.fuel_surcharge = parseFloat(fuelSurcharge) || 0;
      if (detentionRate.trim()) {
        payload.detention_rate = parseFloat(detentionRate) || 0;
        payload.free_time_hrs  = parseInt(freeTimeHrs) || 0;
      }
      if (equipmentType.trim())        payload.equipment_type = equipmentType.trim();
      if (maxWeight.trim())            payload.max_weight_lbs = parseInt(maxWeight) || 0;
      if (paymentTerms.trim())         payload.payment_terms  = paymentTerms.trim();
      return freightJobApi.submitOffer(job.id, payload as any);
    },
    onSuccess: () => {
      setDone(true);
      toast.success('Offer submitted — the shipper will be notified.');
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to submit offer.');
    },
  });

  const inputCls = 'w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20';
  const labelCls = 'block mb-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]';
  const REQ = <span className="ml-1 rounded bg-[var(--color-teal)] px-1 py-0.5 text-[9px] font-bold text-white normal-case tracking-normal">REQ</span>;

  const stops    = (job.stops ?? []).filter((s: any) => s.stop_type === 'pickup');
  const dropoffs = (job.stops ?? []).filter((s: any) => s.stop_type === 'dropoff');

  const panel = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--color-white)] z-50 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
          <div>
            <p className="text-base font-bold text-[var(--color-slate)]">Make an Offer</p>
            <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{job.title || `Job #${job.id}`}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--color-text-faint)] hover:bg-[var(--color-cream-dark)] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Job snapshot */}
          <div className="rounded-xl bg-[var(--color-cream)] px-4 py-3.5 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-faint)]">Job</p>
            {distMiles && (
              <div className="flex items-center gap-2 text-sm">
                <Route size={13} className="text-[var(--color-teal)] shrink-0" />
                <span className="font-semibold text-[var(--color-text)]">{distMiles.toFixed(0)} mi</span>
                {estHrs && (
                  <span className="text-[var(--color-text-faint)]">
                    · {Math.floor(estHrs)}h {Math.round((estHrs % 1) * 60)}m
                  </span>
                )}
              </div>
            )}
            {(stops.length > 0 || dropoffs.length > 0) && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-faint)]">
                <MapPin size={12} className="shrink-0" />
                <span>{stops.length} pickup{stops.length !== 1 ? 's' : ''} · {dropoffs.length} dropoff{dropoffs.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            {qr && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-faint)]">
                <span className="font-semibold text-[var(--color-teal)]">{
                  rateType === 'per_mile' ? 'Per Mile' :
                  rateType === 'hourly'   ? 'Hourly'   : 'Flat Rate'
                }</span>
                <span>pricing requested</span>
              </div>
            )}
          </div>

          {/* ── Rate field ─────────────────────────────────────────── */}

          {rateType === 'flat' && (
            <div>
              <label className={labelCls}>Total amount {REQ}</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input type="number" min="1" step="0.01" value={amount}
                  onChange={e => setAmount(e.target.value)} placeholder="0.00"
                  className={`${inputCls} pl-9 text-base font-semibold`} />
              </div>
            </div>
          )}

          {rateType === 'per_mile' && (
            <div>
              <label className={labelCls}>Rate per mile {REQ}</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input type="number" min="0.01" step="0.01" value={rateValue}
                  onChange={e => setRateValue(e.target.value)} placeholder="0.00 /mi"
                  className={`${inputCls} pl-9 text-base font-semibold`} />
              </div>
              {distMiles && rateValueNum > 0 && (
                <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">
                  {fmt(rateValueNum)}/mi × {distMiles.toFixed(0)} mi ={' '}
                  <strong className="text-[var(--color-teal)]">{fmt(calculatedTotal!)}</strong> total
                </p>
              )}
            </div>
          )}

          {rateType === 'hourly' && (
            <div>
              <label className={labelCls}>Rate per hour {REQ}</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input type="number" min="0.01" step="0.01" value={rateValue}
                  onChange={e => setRateValue(e.target.value)} placeholder="0.00 /hr"
                  className={`${inputCls} pl-9 text-base font-semibold`} />
              </div>
              {estHrs && rateValueNum > 0 && (
                <p className="mt-1.5 text-xs text-[var(--color-text-faint)]">
                  {fmt(rateValueNum)}/hr × {estHrs.toFixed(1)} hrs ={' '}
                  <strong className="text-[var(--color-teal)]">{calculatedTotal ? fmt(calculatedTotal) : '—'}</strong> est. total
                </p>
              )}
            </div>
          )}

          {/* ── Conditional required fields ──────────────────────── */}

          {qr?.require_fuel_surcharge && (
            <div>
              <label className={labelCls}><Fuel size={11} className="inline mr-1" />Fuel surcharge {REQ}</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input type="number" min="0" step="0.01" value={fuelSurcharge}
                  onChange={e => setFuelSurcharge(e.target.value)} placeholder="0.00"
                  className={`${inputCls} pl-9`} />
              </div>
            </div>
          )}

          {qr?.require_detention_rate && (
            <div>
              <label className={labelCls}><Clock size={11} className="inline mr-1" />Detention rate {REQ}</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                  <input type="number" min="0" step="0.01" value={detentionRate}
                    onChange={e => setDetentionRate(e.target.value)} placeholder="0.00 /hr"
                    className={`${inputCls} pl-9`} />
                </div>
                <div>
                  <input type="number" min="0" max="24" value={freeTimeHrs}
                    onChange={e => setFreeTimeHrs(e.target.value)}
                    className={inputCls} placeholder="Free hrs" />
                  <p className="mt-0.5 text-[10px] text-[var(--color-text-faint)]">free hrs before billing</p>
                </div>
              </div>
            </div>
          )}

          {qr?.require_equipment_type && (
            <div>
              <label className={labelCls}><Truck size={11} className="inline mr-1" />Equipment type {REQ}</label>
              <input type="text" value={equipmentType}
                onChange={e => setEquipmentType(e.target.value)}
                placeholder={qr.equipment_type_hint || 'e.g. Dry Van, Reefer, Flatbed…'}
                className={inputCls} />
            </div>
          )}

          {qr?.require_max_weight && (
            <div>
              <label className={labelCls}><Scale size={11} className="inline mr-1" />Max weight capacity {REQ}</label>
              <div className="relative">
                <input type="number" min="1" value={maxWeight}
                  onChange={e => setMaxWeight(e.target.value)}
                  placeholder="e.g. 44000" className={`${inputCls} pr-10`} />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-faint)]">lbs</span>
              </div>
            </div>
          )}

          {qr?.require_payment_terms && (
            <div>
              <label className={labelCls}><CreditCard size={11} className="inline mr-1" />Payment terms {REQ}</label>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_TERMS_OPTIONS.map(opt => (
                  <button key={opt} type="button"
                    onClick={() => setPaymentTerms(opt === paymentTerms ? '' : opt)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      paymentTerms === opt
                        ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)] text-[var(--color-teal)]'
                        : 'border-[var(--color-cream-dark)] text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]'
                    }`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className={labelCls}>
              <MessageSquare size={11} className="inline mr-1" />
              Note to shipper <span className="normal-case font-normal opacity-60">optional</span>
            </label>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} maxLength={500}
              placeholder="Availability, additional details…"
              className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20 resize-none" />
          </div>

          {/* Live offer preview */}
          {finalAmount >= 1 && (
            <div className="rounded-xl border border-[var(--color-teal)] bg-[var(--color-teal-pale)] px-4 py-3.5 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-teal)]">Your offer</p>
              {rateType === 'per_mile' && rateValueNum > 0 && (
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span>Rate</span><span className="font-semibold">{fmt(rateValueNum)}/mi</span>
                </div>
              )}
              {rateType === 'hourly' && rateValueNum > 0 && (
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span>Rate</span><span className="font-semibold">{fmt(rateValueNum)}/hr</span>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-1 border-t border-[var(--color-teal)]/20">
                <span className="text-sm text-[var(--color-text-muted)]">Total</span>
                <span className="text-xl font-bold text-[var(--color-teal)] tabular-nums">{fmt(finalAmount)}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-cream-dark)] bg-[var(--color-white)]">
          {done ? (
            <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={16} /> Offer submitted!
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 rounded-xl border border-[var(--color-cream-dark)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors">
                Cancel
              </button>
              <button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  canSubmit && !mutation.isPending
                    ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm'
                    : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'
                }`}>
                {mutation.isPending
                  ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                  : 'Submit Offer'
                }
              </button>
            </div>
          )}
          <p className="mt-2 text-center text-[11px] text-[var(--color-text-faint)]">
            Shipper will review and accept or decline.
          </p>
        </div>

      </div>
    </>
  );

  return typeof window !== 'undefined' ? createPortal(panel, document.body) : null;
}
