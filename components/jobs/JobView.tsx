'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Package, Truck, Route, CheckCircle2, Clock,
  AlertCircle, FileText, Receipt, Warehouse, Flag,
  ArrowRight, ChevronRight, Loader2, MapPin, Navigation2, Pencil,
  DollarSign, X, Star, BadgeCheck, MessageSquare, Globe, Tag,
} from 'lucide-react';
import { StopEvidence } from '@/components/jobs/StopEvidence';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { freightJobApi } from '@/lib/api';
import { RouteMap } from '@/components/RouteMap';
import type { RouteMapStop } from '@/components/RouteMap';
import { OfferPanel } from '@/components/jobs/OfferPanel';

// ── Status configs ─────────────────────────────────────────────────────────────

const JOB_STATUS: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  draft:       { label: 'Draft',       cls: 'bg-[var(--color-cream)] text-[var(--color-text-muted)]', icon: Clock        },
  posted:      { label: 'Posted',      cls: 'bg-blue-50 text-blue-700',                               icon: Truck        },
  in_progress: { label: 'In Progress', cls: 'bg-amber-50 text-amber-700',                             icon: Navigation2  },
  completed:   { label: 'Completed',   cls: 'bg-emerald-50 text-emerald-700',                         icon: CheckCircle2 },
  cancelled:   { label: 'Cancelled',   cls: 'bg-red-50 text-red-600',                                 icon: AlertCircle  },
  disputed:    { label: 'Disputed',    cls: 'bg-orange-50 text-orange-600',                           icon: AlertCircle  },
};

const STOP_STATUS: Record<string, { label: string; cls: string }> = {
  en_route:  { label: 'En Route',  cls: 'bg-blue-50 text-blue-600'       },
  arrived:   { label: 'Arrived',   cls: 'bg-amber-50 text-amber-600'     },
  completed: { label: 'Done',      cls: 'bg-emerald-50 text-emerald-700' },
};

const NEXT_ACTION: Record<string, { label: string; status: string } | null> = {
  pending:   { label: 'Mark En Route',  status: 'en_route'  },
  en_route:  { label: 'Mark Arrived',   status: 'arrived'   },
  arrived:   { label: 'Complete Stop',  status: 'completed' },
  completed: null,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtAmt(n: number | string | null | undefined) {
  const v = parseFloat(String(n ?? 0)) || 0;
  return '$' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-faint)] shrink-0 pt-px">{label}</p>
      <p className="text-sm font-semibold text-[var(--color-text)] text-right">{value}</p>
    </div>
  );
}

function BillingRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--color-cream-dark)] last:border-0">
      <p className="text-sm text-[var(--color-text)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--color-text)] tabular-nums">{fmtAmt(amount)}</p>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
        <Icon size={14} className="text-[var(--color-teal)]" />
        <p className="text-sm font-bold text-[var(--color-text)]">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export interface JobViewProps {
  job:            any;
  role:           'shipper' | 'carrier';
  backHref:       string;
  backLabel:      string;
  onStopUpdated?: () => void;
  onJobUpdated?:  () => void;   // called after an offer is accepted/declined so parent refetches
}

function fmt(n: number | string | null | undefined) {
  const v = parseFloat(String(n ?? 0)) || 0;
  return '$' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function JobView({ job, role, backHref, backLabel, onStopUpdated, onJobUpdated }: JobViewProps) {
  const [pendingStop,   setPendingStop]   = useState<number | null>(null);
  const [showOfferPanel, setShowOfferPanel] = useState(false);
  const qc = useQueryClient();

  const isContracted = !!job.contract_id;

  const stops = [...(job.stops ?? [])].sort(
    (a: any, b: any) => (a.optimized_sequence ?? a.sequence) - (b.optimized_sequence ?? b.sequence)
  );

  const mapStops: RouteMapStop[] = stops
    .filter((s: any) => s.lat && s.lng)
    .map((s: any, i: number) => ({
      lat:      parseFloat(s.lat),
      lng:      parseFloat(s.lng),
      stopType: s.stop_type as 'pickup' | 'dropoff',
      label:    String.fromCharCode(65 + i),
    }));
  const showMap = mapStops.length >= 2;

  const hasRoute = !!(job.route_distance_miles && parseFloat(job.route_distance_miles) > 0);

  // Status label: contracted posted = Dispatched, open posted = Live
  function statusLabel(s: string) {
    if (s === 'posted') return isContracted ? 'Dispatched' : 'Live';
    return JOB_STATUS[s]?.label ?? s;
  }
  const jobCfg  = JOB_STATUS[job.status] ?? JOB_STATUS.draft;
  const StatusIcon = jobCfg.icon;

  const stopMutation = useMutation({
    mutationFn: ({ stopId, status }: { stopId: number; status: string }) =>
      freightJobApi.updateStop(job.id, stopId, { status }),
    onMutate:  ({ stopId }) => setPendingStop(stopId),
    onSuccess: () => { toast.success('Stop updated.'); setPendingStop(null); onStopUpdated?.(); },
    onError:   () => { toast.error('Failed to update stop.'); setPendingStop(null); },
  });

  // ── Offers (shipper actions) ───────────────────────────────────────────────
  const [pendingOffer, setPendingOffer] = useState<number | null>(null);

  const acceptOfferMutation = useMutation({
    mutationFn: (offerId: number) => freightJobApi.acceptOffer(job.id, offerId),
    onMutate:   (offerId) => setPendingOffer(offerId),
    onSuccess:  () => {
      toast.success('Offer accepted — carrier has been assigned.');
      setPendingOffer(null);
      onJobUpdated?.();
    },
    onError:    () => { toast.error('Failed to accept offer.'); setPendingOffer(null); },
  });

  const declineOfferMutation = useMutation({
    mutationFn: (offerId: number) => freightJobApi.declineOffer(job.id, offerId),
    onMutate:   (offerId) => setPendingOffer(offerId),
    onSuccess:  () => {
      toast.success('Offer declined.');
      setPendingOffer(null);
      onJobUpdated?.();
    },
    onError:    () => { toast.error('Failed to decline offer.'); setPendingOffer(null); },
  });

  const withdrawOfferMutation = useMutation({
    mutationFn: (offerId: number) => freightJobApi.withdrawOffer(job.id, offerId),
    onSuccess:  () => { toast.success('Offer withdrawn.'); onJobUpdated?.(); },
    onError:    () => toast.error('Failed to withdraw offer.'),
  });

  // Carrier's own offer on this job (loaded with job.offers filtered server-side)
  const myOffer = role === 'carrier'
    ? (job.offers ?? []).find((o: any) => o.status === 'pending' || o.status === 'accepted')
    : null;

  const isOpenMarket = !job.carrier_id && job.status === 'posted';
  const canMakeOffer = role === 'carrier' && isOpenMarket && !myOffer;

  // Shipper: show offers section for open jobs
  const offers: any[] = role === 'shipper' && !job.carrier_id
    ? (job.offers ?? []).filter((o: any) => ['pending', 'accepted', 'rejected'].includes(o.status))
    : [];

  return (
    <div className="space-y-5">

      {/* Back nav */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors"
      >
        <ChevronLeft size={14} /> {backLabel}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="text-2xl text-[var(--color-slate)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {job.title || `Job #${job.id}`}
            </h1>

            {/* Type badge */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isContracted
                ? 'bg-purple-50 text-purple-700'
                : 'bg-[var(--color-teal-pale)] text-[var(--color-teal)]'
            }`}>
              {isContracted ? <FileText size={10} /> : <Package size={10} />}
              {isContracted ? 'Contracted' : 'Open'}
            </span>

            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${jobCfg.cls}`}>
              <StatusIcon size={10} /> {statusLabel(job.status)}
            </span>
          </div>

          {job.reference_number && (
            <p className="mt-1 text-sm font-mono text-[var(--color-text-faint)]">{job.reference_number}</p>
          )}
        </div>

        {/* Rate Confirmation + BOL — posted/in-progress/completed */}
        {['posted', 'in_progress', 'completed'].includes(job.status) && (
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/jobs/${job.id}/rate-confirmation`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors"
            >
              <Receipt size={13} /> Rate Confirmation
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/jobs/${job.id}/bol`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors"
            >
              <FileText size={13} /> Bill of Lading
            </a>
          </div>
        )}

        {/* Edit button — draft + shipper only */}
        {role === 'shipper' && job.status === 'draft' && (
          <Link
            href={`/shipper/jobs/contracted/new?edit=${job.id}`}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors"
          >
            <Pencil size={13} /> Edit draft
          </Link>
        )}

        {/* Make an Offer — carrier on open market job */}
        {canMakeOffer && (
          <button
            onClick={() => setShowOfferPanel(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--color-teal)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] shadow-sm transition-colors"
          >
            <DollarSign size={14} /> Make an Offer
          </button>
        )}

        {/* Offer pending chip — carrier already has an active offer */}
        {role === 'carrier' && myOffer && myOffer.status === 'pending' && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-700">
              Offer pending · {fmt(myOffer.amount)}
            </span>
            <button
              onClick={() => withdrawOfferMutation.mutate(myOffer.id)}
              disabled={withdrawOfferMutation.isPending}
              className="ml-1 rounded p-0.5 text-amber-500 hover:text-amber-700 transition-colors disabled:opacity-50"
              title="Withdraw offer"
            >
              {withdrawOfferMutation.isPending
                ? <Loader2 size={12} className="animate-spin" />
                : <X size={12} />
              }
            </button>
          </div>
        )}

        {/* Offer accepted chip */}
        {role === 'carrier' && myOffer && myOffer.status === 'accepted' && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">
              Offer accepted · {fmt(myOffer.amount)}
            </span>
          </div>
        )}
      </div>

      {/* Body: 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: map + stops ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {showMap && (
            <div className="rounded-2xl overflow-hidden border border-[var(--color-cream-dark)] h-64">
              <RouteMap stops={mapStops} />
            </div>
          )}

          {/* Stops */}
          <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
              <MapPin size={14} className="text-[var(--color-teal)]" />
              <p className="text-sm font-bold text-[var(--color-text)]">Stops</p>
              <span className="text-xs text-[var(--color-text-faint)]">({stops.length})</span>
            </div>

            <div className="divide-y divide-[var(--color-cream-dark)]">
              {stops.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-[var(--color-text-faint)]">No stops added yet.</p>
              )}

              {stops.map((stop: any, i: number) => {
                const stopStatus = stop.status ?? 'pending';
                const nextAction = role === 'carrier' && job.status !== 'draft' ? NEXT_ACTION[stopStatus] : null;
                const isPending  = pendingStop === stop.id;
                const isPickup   = stop.stop_type === 'pickup';

                return (
                  <div key={stop.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">

                      {/* Icon + details */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                          isPickup ? 'bg-[var(--color-teal)] text-white' : 'bg-[var(--color-slate)] text-white'
                        }`}>
                          {isPickup ? <Warehouse size={13} /> : <Flag size={13} />}
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--color-text-faint)]">
                            {isPickup ? 'Pickup' : 'Dropoff'} {String.fromCharCode(65 + i)}
                          </p>
                          {stop.name && (
                            <p className="text-sm font-semibold text-[var(--color-text)]">{stop.name}</p>
                          )}
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {stop.address}, {stop.city}, {stop.state} {stop.zip}
                          </p>
                          {(stop.scheduled_date || stop.window_start || stop.window_end) && (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-faint)]">
                              {stop.scheduled_date && (
                                <span className="flex items-center gap-1">
                                  <Clock size={10} /> {fmtDate(stop.scheduled_date)}
                                </span>
                              )}
                              {(stop.window_start || stop.window_end) && (
                                <span>{stop.window_start ?? '—'} – {stop.window_end ?? '—'}</span>
                              )}
                            </div>
                          )}
                          {stop.contact_name && (
                            <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                              {stop.contact_name}{stop.contact_phone ? ` · ${stop.contact_phone}` : ''}
                            </p>
                          )}

                          {/* Items (pickup stops only) */}
                          {isPickup && stop.pickup_items?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {stop.pickup_items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-1.5 text-xs text-[var(--color-text-faint)]">
                                  <Package size={10} className="shrink-0" />
                                  <span>{item.quantity}× {item.unit} — {item.description}</span>
                                  {item.delivery_stop && (
                                    <>
                                      <ArrowRight size={9} className="shrink-0" />
                                      <span className="text-[var(--color-text-muted)]">
                                        {item.delivery_stop.name || item.delivery_stop.city}
                                      </span>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Carrier action */}
                          {nextAction && (
                            <button
                              onClick={() => stopMutation.mutate({ stopId: stop.id, status: nextAction.status })}
                              disabled={!!isPending}
                              className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-[var(--color-teal)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-teal-dark)] disabled:opacity-60 transition-colors"
                            >
                              {isPending
                                ? <Loader2 size={11} className="animate-spin" />
                                : <ChevronRight size={11} />
                              }
                              {nextAction.label}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stop status badge */}
                      {stop.status && STOP_STATUS[stop.status] && (
                        <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STOP_STATUS[stop.status].cls}`}>
                          {stop.status === 'completed'
                            ? <CheckCircle2 size={10} />
                            : <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                          }
                          {STOP_STATUS[stop.status].label}
                        </span>
                      )}
                    </div>

                    {/* Evidence: photos + signature + POD */}
                    <StopEvidence
                      job={{ id: job.id, status: job.status }}
                      stop={{
                        id:              stop.id,
                        stop_type:       stop.stop_type,
                        status:          stop.status,
                        photos_required: stop.photos_required ?? false,
                        signature_url:   stop.signature_url ?? null,
                        signature_name:  stop.signature_name ?? null,
                        signature_at:    stop.signature_at ?? null,
                        pod_pdf_url:     stop.pod_pdf_url ?? null,
                      }}
                      role={role}
                      apiBase={process.env.NEXT_PUBLIC_API_URL ?? ''}
                      onStopChanged={onStopUpdated}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: info panel ──────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Route summary */}
          <SectionCard icon={Route} title="Route">
            {hasRoute ? (
              <div className="space-y-3">
                <InfoRow label="Distance" value={`${parseFloat(job.route_distance_miles).toFixed(1)} mi`} />
                {job.route_duration_minutes && (
                  <InfoRow
                    label="Est. drive"
                    value={`${Math.floor(job.route_duration_minutes / 60)}h ${job.route_duration_minutes % 60}m`}
                  />
                )}
                <InfoRow label="Stops" value={`${stops.length}`} />
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-faint)]">Route not yet calculated.</p>
            )}
            {job.special_instructions && (
              <div className="mt-3 pt-3 border-t border-[var(--color-cream-dark)]">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-faint)] mb-1">Notes</p>
                <p className="text-sm text-[var(--color-text-muted)]">{job.special_instructions}</p>
              </div>
            )}
          </SectionCard>

          {/* Contract (contracted + shipper view) */}
          {isContracted && job.contract && role === 'shipper' && (
            <SectionCard icon={FileText} title="Contract">
              <div className="space-y-3">
                <InfoRow label="Carrier"   value={[job.contract.carrier, job.contract.carrier_company].filter(Boolean).join(' · ')} />
                <InfoRow label="Rate type" value={job.contract.rate_type} />
                <InfoRow label="Rate"      value={String(job.contract.rate)} />
                {job.contract.payment_terms && (
                  <InfoRow label="Payment" value={job.contract.payment_terms} />
                )}
              </div>
            </SectionCard>
          )}

          {/* Shipper info (contracted + carrier view) */}
          {isContracted && role === 'carrier' && job.shipper && (
            <SectionCard icon={Package} title="Shipper">
              <div className="space-y-3">
                <InfoRow label="Name" value={job.shipper.name} />
              </div>
            </SectionCard>
          )}

          {/* Offer Terms (open jobs — visible to both shipper and carrier) */}
          {!isContracted && job.quote_requirements && (() => {
            const qr = job.quote_requirements;
            const RATE_LABEL: Record<string, string> = {
              flat:     'Flat rate',
              per_mile: 'Per mile',
              hourly:   'Hourly',
            };
            const rows: { label: string; value: string; highlight?: boolean }[] = [
              { label: 'Rate type', value: RATE_LABEL[qr.rate_type] ?? qr.rate_type, highlight: true },
              ...(qr.require_fuel_surcharge  ? [{ label: 'Fuel surcharge',     value: 'Required'                                              }] : []),
              ...(qr.require_detention_rate  ? [{ label: 'Detention rate',     value: `Required · ${qr.free_time_hrs ?? 2} free hrs`          }] : []),
              ...(qr.require_equipment_type  ? [{ label: 'Equipment type',     value: qr.equipment_type_hint ? `Required · hint: ${qr.equipment_type_hint}` : 'Required' }] : []),
              ...(qr.require_max_weight      ? [{ label: 'Max weight',         value: 'Required'                                              }] : []),
              ...(qr.require_payment_terms   ? [{ label: 'Payment terms',      value: qr.payment_terms_hint  ? `Required · suggest: ${qr.payment_terms_hint}` : 'Required' }] : []),
            ];
            const presetLabel = qr.preset
              ? qr.preset.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
              : null;

            return (
              <SectionCard icon={Tag} title="Offer Terms">
                {presetLabel && (
                  <div className="flex items-center gap-2 pb-3 mb-1 border-b border-[var(--color-cream-dark)]">
                    <span className="rounded-full bg-[var(--color-teal-pale)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-teal)]">
                      {presetLabel}
                    </span>
                    {role === 'shipper' && (
                      <span className="text-xs text-[var(--color-text-faint)]">preset</span>
                    )}
                  </div>
                )}
                <div className="space-y-0">
                  {rows.map((row, i) => (
                    <div key={i} className={`flex items-center justify-between py-2.5 ${
                      i < rows.length - 1 ? 'border-b border-[var(--color-cream-dark)]' : ''
                    }`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-faint)]">{row.label}</p>
                      <p className={`text-sm font-semibold ${row.highlight ? 'text-[var(--color-teal)]' : 'text-[var(--color-text)]'}`}>
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
                {role === 'shipper' && (
                  <p className="mt-3 pt-3 border-t border-[var(--color-cream-dark)] text-xs text-[var(--color-text-faint)]">
                    Carriers must provide these fields when submitting an offer.
                  </p>
                )}
              </SectionCard>
            );
          })()}

          {/* Billing (contracted + has breakdown) */}
          {isContracted && job.cost_breakdown && (
            <SectionCard icon={Receipt} title="Billing">
              <BillingRow label="Base charge"   amount={job.cost_breakdown.base_amount} />
              {job.cost_breakdown.fuel_amount > 0 && (
                <BillingRow label="Fuel surcharge" amount={job.cost_breakdown.fuel_amount} />
              )}
              <BillingRow label="Platform fee"  amount={job.cost_breakdown.platform_fee} />
              <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-[var(--color-slate)]">
                <p className="text-sm font-bold text-[var(--color-slate)]">Total</p>
                <p className="text-base font-bold text-[var(--color-slate)] tabular-nums">
                  {fmtAmt(job.cost_breakdown.total)}
                </p>
              </div>
            </SectionCard>
          )}

          {/* Offers (shipper · open jobs only) */}
          {role === 'shipper' && !isContracted && (
            <SectionCard icon={Globe} title={`Offers${offers.length > 0 ? ` (${offers.length})` : ''}`}>
              {offers.length === 0 ? (
                <p className="text-sm text-[var(--color-text-faint)]">
                  No offers yet. Carriers viewing this job can submit an offer.
                </p>
              ) : (
                <div className="space-y-3">
                  {offers.map((offer: any) => {
                    const isPending   = offer.status === 'pending';
                    const isAccepted  = offer.status === 'accepted';
                    const isRejected  = offer.status === 'rejected';
                    const isActing    = pendingOffer === offer.id;
                    const distMiles   = job.route_distance_miles ? parseFloat(job.route_distance_miles) : null;
                    const perMile     = distMiles && offer.amount > 0 ? offer.amount / distMiles : null;

                    return (
                      <div
                        key={offer.id}
                        className={`rounded-xl border p-4 space-y-2 ${
                          isAccepted ? 'border-emerald-200 bg-emerald-50' :
                          isRejected ? 'border-[var(--color-cream-dark)] bg-[var(--color-cream)] opacity-60' :
                                       'border-[var(--color-cream-dark)] bg-[var(--color-white)]'
                        }`}
                      >
                        {/* Carrier + amount row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-sm font-semibold text-[var(--color-text)]">
                                {offer.carrier_name || 'Carrier'}
                              </p>
                              {offer.carrier_dot && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-600">
                                  <BadgeCheck size={11} /> DOT
                                </span>
                              )}
                              {offer.carrier_rating > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
                                  <Star size={10} className="fill-amber-400 text-amber-400" />
                                  {offer.carrier_rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            {perMile && (
                              <p className="text-xs text-[var(--color-text-faint)]">
                                {fmt(perMile)}/mi
                              </p>
                            )}
                          </div>
                          <p className="text-lg font-bold text-[var(--color-slate)] tabular-nums shrink-0">
                            {fmt(offer.amount)}
                          </p>
                        </div>

                        {/* Note */}
                        {offer.note && (
                          <p className="flex items-start gap-1.5 text-xs text-[var(--color-text-muted)]">
                            <MessageSquare size={11} className="mt-0.5 shrink-0" />
                            {offer.note}
                          </p>
                        )}

                        {/* Status badge or action buttons */}
                        {isAccepted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={11} /> Accepted
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cream)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-text-faint)]">
                            Declined
                          </span>
                        ) : isPending && !job.carrier_id ? (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => acceptOfferMutation.mutate(offer.id)}
                              disabled={isActing}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-teal)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-teal-dark)] disabled:opacity-60 transition-colors"
                            >
                              {isActing && acceptOfferMutation.isPending
                                ? <Loader2 size={11} className="animate-spin" />
                                : <CheckCircle2 size={11} />
                              }
                              Accept
                            </button>
                            <button
                              onClick={() => declineOfferMutation.mutate(offer.id)}
                              disabled={isActing}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-cream-dark)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:border-red-300 hover:text-red-600 disabled:opacity-60 transition-colors"
                            >
                              {isActing && declineOfferMutation.isPending
                                ? <Loader2 size={11} className="animate-spin" />
                                : <X size={11} />
                              }
                              Decline
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          )}

        </div>
      </div>

      {/* Offer panel overlay */}
      {showOfferPanel && (
        <OfferPanel
          job={job}
          onClose={() => setShowOfferPanel(false)}
          onSuccess={() => { onJobUpdated?.(); qc.invalidateQueries({ queryKey: ['carrier-job', job.id] }); }}
        />
      )}
    </div>
  );
}
