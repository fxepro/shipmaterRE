'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ChevronRight, ChevronLeft, Check, FileText, ClipboardList,
  Route, Send, Plus, X, Search, Loader2,
  Warehouse, Users, ChevronDown, Package, ArrowRight,
  Briefcase, Sparkles,
} from 'lucide-react';
import { contractApi, locationApi, freightJobApi } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type GatewayMode = 'present' | 'new' | null;

interface Contract {
  id:               number;
  carrier:          string;
  carrier_company:  string;
  rate_type:        string;
  rate:             string;
  status:           string;
  optimization_mode?: string;
}

interface LocationOption {
  id:            number;
  name:          string;
  address:       string;
  city:          string;
  state:         string;
  zip:           string;
  lat:           number | null;
  lng:           number | null;
  contact_name:  string | null;
  contact_phone: string | null;
  notes:         string | null;
}

interface ManifestItem {
  localId:             string;
  deliveryStopLocalId: string;
  description:         string;
  quantity:            number;
  unit:                string;
  weightLbs:           string;
  sku:                 string;
}

interface Stop {
  localId:             string;
  stopType:            'pickup' | 'dropoff';
  sequence:            number;
  locationId?:         number;
  contactName:         string;
  contactPhone:        string;
  address:             string;
  city:                string;
  state:               string;
  zip:                 string;
  lat?:                number;
  lng?:                number;
  scheduledDate:       string;
  windowStart:         string;
  windowEnd:           string;
  weightLbs:           string;
  specialInstructions: string;
  items:               ManifestItem[];
}

const UNITS = ['pallet','box','piece','bag','drum','crate','other'];
function uid() { return Math.random().toString(36).slice(2, 9); }

// ── Step Indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Contract',  icon: FileText      },
  { label: 'Build',     icon: ClipboardList },
  { label: 'Route',     icon: Route         },
  { label: 'Send',      icon: Send          },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        const Icon   = step.icon;
        return (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              active ? 'bg-[var(--color-teal)] text-white shadow-sm' :
              done   ? 'bg-[var(--color-teal-pale)] text-[var(--color-teal)]' :
                       'text-[var(--color-text-faint)]'
            }`}>
              {done
                ? <Check size={14} />
                : <Icon size={14} className={active ? 'opacity-100' : 'opacity-50'} />
              }
              <span className="text-sm font-semibold">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className="mx-1 text-[var(--color-text-faint)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Location Search Popover ───────────────────────────────────────────────────

function LocationSearch({ type, onSelect }: { type: 'pickup' | 'delivery'; onSelect: (loc: LocationOption) => void }) {
  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState(false);

  const { data: res } = useQuery({
    queryKey: ['locations', type, search],
    queryFn:  () => locationApi.list({ type, search: search || undefined }),
    enabled:  open,
  });

  const locations: LocationOption[] = res?.data?.data ?? [];

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)] pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={type === 'pickup' ? 'Search warehouses…' : 'Search customers…'}
          className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] pl-9 pr-4 py-2.5 text-sm focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20"
        />
      </div>
      {open && locations.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-[var(--color-cream-dark)] bg-white shadow-lg max-h-52 overflow-y-auto">
          {locations.map(loc => (
            <button
              key={loc.id}
              onMouseDown={() => { onSelect(loc); setOpen(false); setSearch(''); }}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--color-cream)] transition-colors"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-teal-pale)] mt-0.5">
                {type === 'pickup' ? <Warehouse size={12} className="text-[var(--color-teal)]" /> : <Users size={12} className="text-[var(--color-teal)]" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)] truncate">{loc.name}</p>
                <p className="text-xs text-[var(--color-text-faint)]">{loc.address}, {loc.city}, {loc.state}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stop Card ─────────────────────────────────────────────────────────────────

function StopCard({ stop, dropoffStops, onUpdate, onRemove, index }: {
  stop:         Stop;
  dropoffStops: Stop[];
  onUpdate:     (s: Stop) => void;
  onRemove:     () => void;
  index:        number;
}) {
  const isPickup = stop.stopType === 'pickup';
  const inputCls = 'w-full rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3 py-2 text-sm focus:border-[var(--color-teal)] focus:outline-none';
  const labelCls = 'block mb-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-faint)]';

  function set<K extends keyof Stop>(k: K, v: Stop[K]) { onUpdate({ ...stop, [k]: v }); }
  function addItem() {
    onUpdate({ ...stop, items: [...stop.items, {
      localId: uid(), deliveryStopLocalId: dropoffStops[0]?.localId ?? '',
      description: '', quantity: 1, unit: 'pallet', weightLbs: '', sku: '',
    }]});
  }
  function updateItem(idx: number, patch: Partial<ManifestItem>) {
    onUpdate({ ...stop, items: stop.items.map((it, i) => i === idx ? { ...it, ...patch } : it) });
  }
  function removeItem(idx: number) {
    onUpdate({ ...stop, items: stop.items.filter((_, i) => i !== idx) });
  }

  return (
    <div className={`rounded-xl border ${isPickup ? 'border-[var(--color-teal)]' : 'border-amber-300'} bg-[var(--color-white)]`}>
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${isPickup ? 'bg-[var(--color-teal-pale)]' : 'bg-amber-50'}`}>
        <div className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${isPickup ? 'bg-[var(--color-teal)]' : 'bg-amber-500'}`}>
            {index + 1}
          </div>
          <span className={`text-sm font-semibold ${isPickup ? 'text-[var(--color-teal)]' : 'text-amber-700'}`}>
            {isPickup ? 'Pickup' : 'Dropoff'}
          </span>
          {stop.city && <span className="text-xs text-[var(--color-text-faint)]">— {stop.city}, {stop.state}</span>}
        </div>
        <button onClick={onRemove} className="rounded-lg p-1 text-[var(--color-text-faint)] hover:text-red-500 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="px-4 pb-4 pt-3 space-y-3">
        <LocationSearch
          type={isPickup ? 'pickup' : 'delivery'}
          onSelect={loc => onUpdate({
            ...stop,
            locationId: loc.id, address: loc.address, city: loc.city,
            state: loc.state, zip: loc.zip,
            lat: loc.lat ?? undefined, lng: loc.lng ?? undefined,
            contactName: loc.contact_name ?? '', contactPhone: loc.contact_phone ?? '',
          })}
        />
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3">
            <label className={labelCls}>Address</label>
            <input value={stop.address} onChange={e => set('address', e.target.value)} placeholder="Street address" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input value={stop.city} onChange={e => set('city', e.target.value)} placeholder="City" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>State</label>
            <input value={stop.state} onChange={e => set('state', e.target.value.toUpperCase().slice(0,2))} placeholder="IL" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ZIP</label>
            <input value={stop.zip} onChange={e => set('zip', e.target.value)} placeholder="60601" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2">
            <label className={labelCls}>Date</label>
            <input type="date" value={stop.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>From</label>
            <input type="time" value={stop.windowStart} onChange={e => set('windowStart', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>To</label>
            <input type="time" value={stop.windowEnd} onChange={e => set('windowEnd', e.target.value)} className={inputCls} />
          </div>
        </div>

        {isPickup && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Manifest items</p>
              <button onClick={addItem} disabled={dropoffStops.length === 0}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--color-teal)] hover:underline disabled:opacity-40 disabled:no-underline">
                <Plus size={11} /> Add item
              </button>
            </div>
            {dropoffStops.length === 0 && (
              <p className="text-xs text-[var(--color-text-faint)] italic">Add dropoff stops first to assign items</p>
            )}
            {stop.items.map((item, idx) => (
              <div key={item.localId} className="rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-cream)] p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <label className={labelCls}>Description</label>
                    <input value={item.description} onChange={e => updateItem(idx, { description: e.target.value })}
                      placeholder="e.g. Widgets, Spare Parts" className={inputCls} />
                  </div>
                  <button onClick={() => removeItem(idx)} className="mt-5 rounded-lg p-1 text-[var(--color-text-faint)] hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className={labelCls}>Qty</label>
                    <input type="number" min={1} value={item.quantity}
                      onChange={e => updateItem(idx, { quantity: parseInt(e.target.value) || 1 })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Unit</label>
                    <div className="relative">
                      <select value={item.unit} onChange={e => updateItem(idx, { unit: e.target.value })}
                        className={`${inputCls} appearance-none pr-6`}>
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Lbs</label>
                    <input type="number" min={0} value={item.weightLbs}
                      onChange={e => updateItem(idx, { weightLbs: e.target.value })} placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Deliver to</label>
                    <div className="relative">
                      <select value={item.deliveryStopLocalId}
                        onChange={e => updateItem(idx, { deliveryStopLocalId: e.target.value })}
                        className={`${inputCls} appearance-none pr-6`}>
                        {dropoffStops.map(d => (
                          <option key={d.localId} value={d.localId}>{d.city || `Dropoff ${d.sequence}`}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Route Result ──────────────────────────────────────────────────────────────

function RouteResult({ job }: { job: any }) {
  if (!job?.stops) return null;
  const ordered = [...job.stops].sort(
    (a: any, b: any) => (a.optimized_sequence ?? a.sequence) - (b.optimized_sequence ?? b.sequence)
  );
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-slate)]">{job.route_distance_miles?.toFixed(0) ?? '—'}</p>
          <p className="text-xs text-[var(--color-text-faint)] mt-0.5">miles</p>
        </div>
        <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-slate)]">
            {job.route_duration_minutes ? `${Math.floor(job.route_duration_minutes / 60)}h ${job.route_duration_minutes % 60}m` : '—'}
          </p>
          <p className="text-xs text-[var(--color-text-faint)] mt-0.5">est. drive time</p>
        </div>
      </div>
      <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] overflow-hidden">
        {ordered.map((stop: any, i: number) => (
          <div key={stop.id} className={`flex items-center gap-4 px-4 py-3 ${i < ordered.length - 1 ? 'border-b border-[var(--color-cream-dark)]' : ''}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${stop.stop_type === 'pickup' ? 'bg-[var(--color-teal)]' : 'bg-amber-500'}`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] capitalize">{stop.stop_type} — {stop.city}, {stop.state}</p>
              <p className="text-xs text-[var(--color-text-faint)] truncate">{stop.address}</p>
            </div>
            {stop.window_start && <p className="shrink-0 text-xs text-[var(--color-text-faint)]">{stop.window_start}–{stop.window_end}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewContractedJobPage() {
  const router = useRouter();

  // Gateway
  const [gatewayMode, setGatewayMode] = useState<GatewayMode>(null);

  // Step (0=Contract, 1=Build, 2=Route, 3=Send)
  const [step, setStep] = useState(0);

  // Step 1
  const [contractId, setContractId] = useState<number | null>(null);

  // Step 2
  const [title,        setTitle]        = useState('');
  const [refNum,       setRefNum]        = useState('');
  const [instructions, setInstructions] = useState('');
  const [optimMode,    setOptimMode]    = useState<'shortest_route' | 'cluster_pickups'>('shortest_route');
  const [stops,        setStops]        = useState<Stop[]>([]);

  // Step 3
  const [createdJob, setCreatedJob] = useState<any>(null);
  const [optimised,  setOptimised]  = useState(false);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: contractsRes, isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts', 'active'],
    queryFn:  () => contractApi.list({ status: 'active' }),
    enabled:  gatewayMode === 'present',
  });

  const contracts: Contract[] = (contractsRes?.data?.data ?? []).map((c: any) => ({
    id:               c.id,
    carrier:          c.carrier         ?? '',
    carrier_company:  c.carrierCompany  ?? c.carrier_company ?? '',
    rate_type:        c.rate_type       ?? '',
    rate:             c.rate            ?? '',
    status:           c.status          ?? '',
    optimization_mode: c.optimization_mode,
  }));

  const selectedContract = contracts.find(c => c.id === contractId) ?? null;

  // ── Stop helpers ───────────────────────────────────────────────────────────

  const pickupStops  = stops.filter(s => s.stopType === 'pickup');
  const dropoffStops = stops.filter(s => s.stopType === 'dropoff');

  function addStop(type: 'pickup' | 'dropoff') {
    setStops(prev => [...prev, {
      localId: uid(), stopType: type, sequence: prev.length + 1,
      contactName: '', contactPhone: '', address: '', city: '', state: '', zip: '',
      scheduledDate: '', windowStart: '', windowEnd: '', weightLbs: '', specialInstructions: '',
      items: [],
    }]);
  }

  function updateStop(localId: string, updated: Stop) {
    setStops(prev => prev.map(s => s.localId === localId ? updated : s));
  }

  function removeStop(localId: string) {
    setStops(prev => {
      const next = prev.filter(s => s.localId !== localId);
      return next.map(s => ({ ...s, items: s.items.filter(it => it.deliveryStopLocalId !== localId) }));
    });
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: () => {
      const allStops = stops.map((s, i) => ({
        stop_type:            s.stopType,
        sequence:             i + 1,
        location_id:          s.locationId ?? null,
        contact_name:         s.contactName || null,
        contact_phone:        s.contactPhone || null,
        address:              s.address,
        city:                 s.city,
        state:                s.state,
        zip:                  s.zip,
        lat:                  s.lat ?? null,
        lng:                  s.lng ?? null,
        scheduled_date:       s.scheduledDate || null,
        window_start:         s.windowStart || null,
        window_end:           s.windowEnd || null,
        weight_lbs:           s.weightLbs ? parseInt(s.weightLbs) : null,
        special_instructions: s.specialInstructions || null,
        items: s.stopType === 'pickup'
          ? s.items
              .filter(it => it.description)
              .map(it => {
                const deliveryStop = stops.find(ds => ds.localId === it.deliveryStopLocalId);
                const deliverySeq  = deliveryStop ? stops.indexOf(deliveryStop) + 1 : null;
                return {
                  delivery_stop_sequence: deliverySeq,
                  description:            it.description,
                  quantity:               it.quantity,
                  unit:                   it.unit,
                  weight_lbs:             it.weightLbs ? parseInt(it.weightLbs) : null,
                  sku:                    it.sku || null,
                };
              }).filter(it => it.delivery_stop_sequence)
          : undefined,
      }));
      return freightJobApi.create({
        contract_id:          contractId!,
        title:                title || null,
        reference_number:     refNum || null,
        special_instructions: instructions || null,
        optimization_mode:    optimMode,
        stops:                allStops,
      });
    },
    onSuccess: res => { setCreatedJob(res.data.data); setStep(2); },
  });

  const optimiseMutation = useMutation({
    mutationFn: () => freightJobApi.optimise(createdJob.id),
    onSuccess:  res => { setCreatedJob(res.data.data); setOptimised(true); },
  });

  const postMutation = useMutation({
    mutationFn: () => freightJobApi.post(createdJob.id),
    onSuccess:  () => router.push('/shipper/jobs/contracted'),
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  const canProceedStep1 = !!contractId;
  const canProceedStep2 = stops.length >= 2
    && pickupStops.length >= 1
    && dropoffStops.length >= 1
    && stops.every(s => s.address && s.city && s.state);

  const inputCls = 'w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20';
  const labelCls = 'block mb-1.5 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
          New Contracted Job
        </h1>
        <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">
          Build a multi-stop job manifest and dispatch to your carrier
        </p>
      </div>

      {/* ── Gateway ── */}
      {gatewayMode === null && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.07em]">
            How do you want to proceed?
          </p>
          <div className="grid grid-cols-2 gap-4">

            {/* Present Contract */}
            <button
              onClick={() => setGatewayMode('present')}
              className="group relative rounded-2xl border-2 border-[var(--color-cream-dark)] bg-[var(--color-white)] p-6 text-left hover:border-[var(--color-teal)] transition-all hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-teal-pale)] group-hover:bg-[var(--color-teal)] transition-colors mb-4">
                <Briefcase size={22} className="text-[var(--color-teal)] group-hover:text-white transition-colors" />
              </div>
              <p className="text-base font-bold text-[var(--color-text)]">Present Contract</p>
              <p className="mt-1 text-sm text-[var(--color-text-faint)] leading-snug">
                Use an existing carrier contract. Rate and terms are already agreed.
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[var(--color-teal)] opacity-0 group-hover:opacity-100 transition-opacity">
                Select contract <ArrowRight size={14} />
              </div>
            </button>

            {/* New Contract */}
            <button
              onClick={() => router.push('/shipper/contracts?create=1')}
              className="group relative rounded-2xl border-2 border-[var(--color-cream-dark)] bg-[var(--color-white)] p-6 text-left hover:border-[var(--color-slate)] transition-all hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-cream)] group-hover:bg-[var(--color-slate)] transition-colors mb-4">
                <Sparkles size={22} className="text-[var(--color-text-muted)] group-hover:text-white transition-colors" />
              </div>
              <p className="text-base font-bold text-[var(--color-text)]">New Contract</p>
              <p className="mt-1 text-sm text-[var(--color-text-faint)] leading-snug">
                Set up a new carrier agreement first, then create jobs against it.
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                Go to Contracts <ArrowRight size={14} />
              </div>
            </button>

          </div>
        </div>
      )}

      {/* ── 4-step flow (Present Contract path) ── */}
      {gatewayMode === 'present' && (
        <>
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setGatewayMode(null); setContractId(null); setStep(0); }}
              className="flex items-center gap-1 text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors"
            >
              <ChevronLeft size={13} /> Change
            </button>
            <StepIndicator current={step} />
          </div>

          {/* ── Step 1: Contract ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-6 space-y-4">
                <h2 className="text-base font-semibold text-[var(--color-text)]">Select contract</h2>

                {contractsLoading ? (
                  <div className="space-y-2">
                    {[1,2].map(i => (
                      <div key={i} className="animate-pulse h-16 rounded-xl bg-[var(--color-cream)]" />
                    ))}
                  </div>
                ) : contracts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--color-cream-dark)] py-8 text-center">
                    <FileText size={28} className="mx-auto text-[var(--color-cream-dark)] mb-2" />
                    <p className="text-sm text-[var(--color-text-muted)]">No active contracts</p>
                    <a href="/shipper/contracts" className="mt-2 inline-block text-sm font-semibold text-[var(--color-teal)] hover:underline">
                      Create a contract first
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contracts.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setContractId(c.id);
                          if (c.optimization_mode) setOptimMode(c.optimization_mode as any);
                        }}
                        className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                          contractId === c.id
                            ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)]'
                            : 'border-[var(--color-cream-dark)] hover:border-[var(--color-teal)]'
                        }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${contractId === c.id ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-slate)]'}`}>
                          <FileText size={15} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--color-text)]">{c.carrier}</p>
                          <p className="text-xs text-[var(--color-text-faint)]">{c.carrier_company} · {c.rate_type}{c.rate ? ` · $${c.rate}` : ''}</p>
                        </div>
                        {contractId === c.id && <Check size={16} className="text-[var(--color-teal)]" />}
                      </button>
                    ))}
                  </div>
                )}

                {contractId && (
                  <div>
                    <label className={labelCls}>Route optimisation</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { value: 'shortest_route',  label: 'Shortest Route',  desc: 'Freely interleave pickups & dropoffs' },
                        { value: 'cluster_pickups', label: 'Cluster Pickups', desc: 'All pickups first, then dropoffs'       },
                      ] as const).map(opt => (
                        <button key={opt.value} onClick={() => setOptimMode(opt.value)}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            optimMode === opt.value
                              ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)]'
                              : 'border-[var(--color-cream-dark)] hover:border-[var(--color-teal)]'
                          }`}>
                          <p className="text-sm font-semibold text-[var(--color-text)]">{opt.label}</p>
                          <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button onClick={() => setStep(1)} disabled={!canProceedStep1}
                  className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                    canProceedStep1
                      ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm'
                      : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'
                  }`}>
                  Next: Build manifest <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Build ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 space-y-4">
                <h2 className="text-base font-semibold text-[var(--color-text)]">Job details</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Title <span className="normal-case font-normal opacity-60">optional</span></label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Chicago run" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Reference # <span className="normal-case font-normal opacity-60">optional</span></label>
                    <input value={refNum} onChange={e => setRefNum(e.target.value)} placeholder="ORD-1234" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Special instructions <span className="normal-case font-normal opacity-60">optional</span></label>
                  <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
                    rows={2} placeholder="Fragile cargo, call ahead at each stop…" className={`${inputCls} resize-none`} />
                </div>
              </div>

              {/* Pickups */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[var(--color-text)]">
                    Pickups <span className="ml-1 text-sm font-normal text-[var(--color-text-faint)]">({pickupStops.length})</span>
                  </h2>
                  <button onClick={() => addStop('pickup')}
                    className="flex items-center gap-1.5 rounded-xl border border-[var(--color-teal)] px-3 py-1.5 text-sm font-semibold text-[var(--color-teal)] hover:bg-[var(--color-teal-pale)] transition-colors">
                    <Plus size={13} /> Add pickup
                  </button>
                </div>
                {pickupStops.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[var(--color-cream-dark)] py-6 text-center">
                    <p className="text-sm text-[var(--color-text-faint)]">No pickup stops yet</p>
                  </div>
                )}
                {pickupStops.map((stop, i) => (
                  <StopCard key={stop.localId} stop={stop} dropoffStops={dropoffStops} index={i}
                    onUpdate={s => updateStop(stop.localId, s)} onRemove={() => removeStop(stop.localId)} />
                ))}
              </div>

              {/* Dropoffs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[var(--color-text)]">
                    Dropoffs <span className="ml-1 text-sm font-normal text-[var(--color-text-faint)]">({dropoffStops.length})</span>
                  </h2>
                  <button onClick={() => addStop('dropoff')}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-400 px-3 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors">
                    <Plus size={13} /> Add dropoff
                  </button>
                </div>
                {dropoffStops.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[var(--color-cream-dark)] py-6 text-center">
                    <p className="text-sm text-[var(--color-text-faint)]">No dropoff stops yet</p>
                  </div>
                )}
                {dropoffStops.map((stop, i) => (
                  <StopCard key={stop.localId} stop={stop} dropoffStops={dropoffStops} index={i}
                    onUpdate={s => updateStop(stop.localId, s)} onRemove={() => removeStop(stop.localId)} />
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(0)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <ChevronLeft size={15} /> Back
                </button>
                <button onClick={() => createMutation.mutate()}
                  disabled={!canProceedStep2 || createMutation.isPending}
                  className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                    canProceedStep2 && !createMutation.isPending
                      ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm'
                      : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'
                  }`}>
                  {createMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                  Next: Plan route <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Route ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--color-text)]">Route optimisation</h2>
                    <p className="text-sm text-[var(--color-text-faint)] mt-0.5">
                      System calculates the shortest route respecting all pickup-before-delivery constraints
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--color-cream)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-muted)] capitalize">
                    {optimMode.replace('_', ' ')}
                  </span>
                </div>

                {!optimised ? (
                  <button onClick={() => optimiseMutation.mutate()} disabled={optimiseMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-teal)] py-3 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] transition-colors shadow-sm disabled:opacity-60">
                    {optimiseMutation.isPending
                      ? <><Loader2 size={15} className="animate-spin" /> Calculating optimal route…</>
                      : <><Route size={15} /> Calculate optimal route</>
                    }
                  </button>
                ) : (
                  <RouteResult job={createdJob} />
                )}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => { setStep(1); setOptimised(false); }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <ChevronLeft size={15} /> Back to manifest
                </button>
                <button onClick={() => setStep(3)} disabled={!optimised}
                  className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                    optimised
                      ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm'
                      : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'
                  }`}>
                  Review & send <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Review & Send ── */}
          {step === 3 && createdJob && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-6 space-y-5">
                <h2 className="text-base font-semibold text-[var(--color-text)]">Review & dispatch</h2>

                <div className="rounded-xl bg-[var(--color-cream)] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-[var(--color-teal)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-faint)]">Contract</p>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {selectedContract?.carrier} · {selectedContract?.carrier_company}
                      </p>
                    </div>
                  </div>
                  {title && (
                    <div className="flex items-center gap-3">
                      <Package size={14} className="text-[var(--color-teal)]" />
                      <div>
                        <p className="text-xs text-[var(--color-text-faint)]">Job title</p>
                        <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Route size={14} className="text-[var(--color-teal)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-faint)]">Route</p>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {createdJob.route_distance_miles?.toFixed(0)} mi · {pickupStops.length} pickup{pickupStops.length !== 1 ? 's' : ''} · {dropoffStops.length} dropoff{dropoffStops.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <RouteResult job={createdJob} />

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-800">
                    <strong>Carrier will be notified immediately.</strong> No acceptance required — the existing contract covers this job.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <ChevronLeft size={15} /> Back
                </button>
                <button onClick={() => postMutation.mutate()} disabled={postMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] shadow-sm transition-colors disabled:opacity-60">
                  {postMutation.isPending
                    ? <><Loader2 size={13} className="animate-spin" /> Dispatching…</>
                    : <><Send size={15} /> Dispatch to carrier</>
                  }
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
