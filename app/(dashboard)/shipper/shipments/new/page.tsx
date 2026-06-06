'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package, MapPin, Truck, ClipboardCheck,
  ChevronLeft, Loader2, Star, Check, ArrowLeft,
  Ruler, Clock, Navigation2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { StaticRouteMap } from '@/components/maps/StaticRouteMap';
import { shipmentApi, serviceTypeApi } from '@/lib/api';
import { isDemoMode } from '@/lib/demo';
import { useQuery } from '@tanstack/react-query';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ShipmentForm {
  // Step 1 – Details
  description: string;
  serviceTypeKey: string;
  category: string;
  weightLbs: string;
  handling: string[];
  instructions: string;
  // Step 2 – Route
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  pickupResolved?: string;
  pickupDate: string;
  pickupWindow: string;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryResolved?: string;
  deliveryDate: string;
  deliveryWindow: string;
  routeDistanceM?: number;
  routeDurationS?: number;
  // Step 3 – Carrier
  carrierId?: number;
  receiverEmail: string;
  // Step 4 – Cost
  cost: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'General Freight',
  'Medical / Healthcare',
  'Electronics',
  'Perishables',
  'Hazardous Materials',
  'Oversized / Heavy',
  'Documents / Parcels',
  'Industrial Equipment',
];

const HANDLING = [
  'Fragile',
  'Temperature Controlled',
  'Liftgate Required',
  'Inside Delivery',
  'White Glove',
  'Stackable',
];

const WINDOWS = ['All day (8am–6pm)', 'Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–8pm)'];

const MOCK_CARRIERS = [
  { id: 1, name: 'Carlos Rodriguez', company: 'Rodriguez Freight LLC', dot: '3842910', rating: 4.9, jobs: 284 },
  { id: 2, name: 'Mike Thompson',    company: 'Midwest Haulers Inc.',   dot: '2913847', rating: 4.7, jobs: 156 },
  { id: 3, name: 'Sarah Kim',        company: 'Pacific Coast Transport',dot: '1928374', rating: 4.8, jobs: 203 },
];

const STEPS = [
  { label: 'Details',  icon: Package },
  { label: 'Route',    icon: MapPin },
  { label: 'Carrier',  icon: Truck },
  { label: 'Review',   icon: ClipboardCheck },
];

const EMPTY: ShipmentForm = {
  description: '', serviceTypeKey: '', category: '', weightLbs: '', handling: [], instructions: '',
  pickupAddress: '', pickupDate: '', pickupWindow: WINDOWS[0],
  deliveryAddress: '', deliveryDate: '', deliveryWindow: WINDOWS[0],
  carrierId: undefined, receiverEmail: '', cost: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDist(m: number)  { return `${(m * 0.000621371).toFixed(1)} mi`; }
function fmtTime(s: number)  { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h}h ${m}m` : `${m} min`; }

async function geocodeAddr(addr: string) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'Shipmater/1.0' } },
    );
    const d = await r.json();
    if (!d.length) return null;
    return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon), display: d[0].display_name.split(',').slice(0, 3).join(',') };
  } catch { return null; }
}

async function fetchRouteDist(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  try {
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`);
    const d = await r.json();
    if (d.code !== 'Ok') return null;
    return { distance: d.routes[0].distance as number, duration: d.routes[0].duration as number };
  } catch { return null; }
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

const INPUT = 'w-full rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-teal)] transition-colors placeholder:text-[var(--color-text-faint)]';
const INPUT_ERR = 'border-red-300 bg-red-50 focus:border-red-400';

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)]">{children}</p>;
}
function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-sm text-red-500">{msg}</p> : null;
}

// ── Main page ─────────────────────────────────────────────────────────────────

function NewShipmentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ShipmentForm>(EMPTY);

  // Load service type categories from API
  const { data: serviceTypeCategories = [] } = useQuery({
    queryKey: ['service-types'],
    queryFn:  () => serviceTypeApi.list().then(r => r.data.data),
  });

  // Pre-fill from route planner query params
  useEffect(() => {
    const pickup      = searchParams.get('pickup');
    const pickupLat   = searchParams.get('pickupLat');
    const pickupLng   = searchParams.get('pickupLng');
    const delivery    = searchParams.get('delivery');
    const deliveryLat = searchParams.get('deliveryLat');
    const deliveryLng = searchParams.get('deliveryLng');
    const distanceM   = searchParams.get('distanceM');
    const durationS   = searchParams.get('durationS');

    if (pickup && pickupLat && delivery && deliveryLat) {
      setForm(f => ({
        ...f,
        pickupAddress:    pickup,
        pickupResolved:   pickup,
        pickupLat:        parseFloat(pickupLat),
        pickupLng:        parseFloat(pickupLng ?? '0'),
        deliveryAddress:  delivery,
        deliveryResolved: delivery,
        deliveryLat:      parseFloat(deliveryLat),
        deliveryLng:      parseFloat(deliveryLng ?? '0'),
        ...(distanceM ? { routeDistanceM: parseFloat(distanceM) } : {}),
        ...(durationS  ? { routeDurationS:  parseFloat(durationS)  } : {}),
      }));
      // Jump straight to Route step since addresses are filled
      setStep(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [errors, setErrors] = useState<Partial<Record<keyof ShipmentForm, string>>>({});
  const [geocodingPickup, setGeocodingPickup] = useState(false);
  const [geocodingDelivery, setGeocodingDelivery] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Form helpers ────────────────────────────────────────────────────────────

  function upd<K extends keyof ShipmentForm>(key: K, val: ShipmentForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function toggleHandling(opt: string) {
    upd('handling', form.handling.includes(opt)
      ? form.handling.filter(h => h !== opt)
      : [...form.handling, opt]);
  }

  // ── Geocoding ───────────────────────────────────────────────────────────────

  // addr is passed directly from e.target.value to avoid stale closure reads
  async function handleGeocode(field: 'pickup' | 'delivery', addr: string) {
    if (!addr.trim()) return;

    field === 'pickup' ? setGeocodingPickup(true) : setGeocodingDelivery(true);
    const geo = await geocodeAddr(addr);
    field === 'pickup' ? setGeocodingPickup(false) : setGeocodingDelivery(false);

    if (!geo) {
      setErrors(e => ({ ...e, [`${field}Address`]: 'Address not found — try a more specific address' }));
      return;
    }

    // Store geocoded coords
    let updatedForm = form;
    if (field === 'pickup') {
      updatedForm = { ...form, pickupLat: geo.lat, pickupLng: geo.lng, pickupResolved: geo.display };
    } else {
      updatedForm = { ...form, deliveryLat: geo.lat, deliveryLng: geo.lng, deliveryResolved: geo.display };
    }
    setForm(updatedForm);
    setErrors(e => ({ ...e, [`${field}Address`]: undefined }));

    // Auto-calc route if both geocoded
    const pu = field === 'pickup' ? { lat: geo.lat, lng: geo.lng } : (form.pickupLat ? { lat: form.pickupLat, lng: form.pickupLng! } : null);
    const dl = field === 'delivery' ? { lat: geo.lat, lng: geo.lng } : (form.deliveryLat ? { lat: form.deliveryLat, lng: form.deliveryLng! } : null);

    if (pu && dl) {
      setRouteLoading(true);
      const route = await fetchRouteDist(pu, dl);
      if (route) setForm(f => ({ ...f, routeDistanceM: route.distance, routeDurationS: route.duration }));
      setRouteLoading(false);
    }
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Partial<Record<keyof ShipmentForm, string>> = {};

    if (step === 0) {
      if (!form.description.trim())       e.description = 'Required';
      if (!form.category)                 e.category = 'Select a category';
      if (!form.weightLbs || +form.weightLbs <= 0) e.weightLbs = 'Enter a valid weight';
    }
    if (step === 1) {
      if (!form.pickupAddress.trim())     e.pickupAddress = 'Required';
      else if (!form.pickupLat)           e.pickupAddress = 'Geocode the address first (click out of the field)';
      if (!form.pickupDate)               e.pickupDate = 'Required';
      if (!form.deliveryAddress.trim())   e.deliveryAddress = 'Required';
      else if (!form.deliveryLat)         e.deliveryAddress = 'Geocode the address first (click out of the field)';
      if (!form.deliveryDate)             e.deliveryDate = 'Required';
    }
    if (step === 2) {
      if (!form.carrierId)                (e as any).carrierId = 'Select a carrier';
    }
    if (step === 3) {
      if (!form.cost || +form.cost <= 0)  e.cost = 'Enter the agreed shipment cost';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  function handleNext() {
    if (!validate()) return;
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    handleSubmit();
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (isDemoMode()) {
        // Demo mode — no real session; simulate the call
        await new Promise(r => setTimeout(r, 900));
      } else {
        const distanceMiles = form.routeDistanceM
          ? +(form.routeDistanceM / 1609.34).toFixed(2)
          : undefined;
        const durationMins = form.routeDurationS
          ? Math.round(form.routeDurationS / 60)
          : undefined;

        // Parse city/state from resolved geocoded string e.g. "Denver, Colorado, United States"
        const parseCity = (resolved?: string) => resolved?.split(',')[0]?.trim();
        const parseState = (resolved?: string) => {
          const parts = resolved?.split(',');
          return parts && parts.length >= 2 ? parts[1]?.trim() : undefined;
        };

        await shipmentApi.create({
          item_description:       form.description,
          item_category:          form.category || undefined,
          weight_lbs:             form.weightLbs ? +form.weightLbs : undefined,
          handling_requirements:  form.handling.length ? form.handling : undefined,
          special_notes:          form.instructions || undefined,

          pickup_address:         form.pickupResolved ?? form.pickupAddress,
          pickup_city:            parseCity(form.pickupResolved),
          pickup_state:           parseState(form.pickupResolved),
          pickup_lat:             form.pickupLat,
          pickup_lng:             form.pickupLng,
          pickup_date:            form.pickupDate || undefined,
          pickup_time_window:     form.pickupWindow || undefined,

          delivery_address:       form.deliveryResolved ?? form.deliveryAddress,
          delivery_city:          parseCity(form.deliveryResolved),
          delivery_state:         parseState(form.deliveryResolved),
          delivery_lat:           form.deliveryLat,
          delivery_lng:           form.deliveryLng,
          delivery_date:          form.deliveryDate || undefined,
          delivery_time_window:   form.deliveryWindow || undefined,

          distance_miles:         distanceMiles,
          estimated_duration_mins: durationMins,

          carrier_id:             form.carrierId,
          receiver_email:         form.receiverEmail || undefined,
          service_type_key:       form.serviceTypeKey || undefined,
          agreed_cost:            form.cost ? +form.cost : undefined,
        });
      }
      toast.success('Shipment created — carrier has been notified.');
      router.push('/shipper/shipments');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to create shipment. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const carrier = MOCK_CARRIERS.find(c => c.id === form.carrierId);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      {/* Back link */}
      <Link href="/shipper/shipments" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors">
        <ArrowLeft size={14} /> My Shipments
      </Link>

      <div>
        <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
          New Shipment
        </h1>
        <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">Create a shipment and assign it directly to a carrier</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map(({ label, icon: Icon }, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                i < step  ? 'bg-[var(--color-teal)] text-white' :
                i === step ? 'bg-[var(--color-slate)] text-white' :
                             'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)]',
              )}>
                {i < step ? <Check size={13} /> : <Icon size={13} />}
              </div>
              <p className={cn('text-xs font-medium', i === step ? 'text-[var(--color-text)]' : 'text-[var(--color-text-faint)]')}>
                {label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('mb-4 h-[2px] flex-1 mx-2 transition-colors', i < step ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-cream-dark)]')} />
            )}
          </div>
        ))}
      </div>

      {/* Step card */}
      <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

        {/* ── Step 0: Details ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <Label>Item / Shipment Description *</Label>
              <input
                value={form.description}
                onChange={e => upd('description', e.target.value)}
                placeholder="e.g. MRI machine, pallet of medical supplies, industrial generator…"
                className={cn(INPUT, errors.description && INPUT_ERR)}
              />
              <Err msg={errors.description} />
            </div>

            <div>
              <Label>Service Type *</Label>
              <select
                value={form.serviceTypeKey}
                onChange={e => { upd('serviceTypeKey', e.target.value); upd('category', e.target.options[e.target.selectedIndex]?.text || ''); }}
                className={cn(INPUT, errors.serviceTypeKey && INPUT_ERR)}
              >
                <option value="">Select service type…</option>
                {(serviceTypeCategories as any[]).map((cat: any) => (
                  <optgroup key={cat.key} label={`${cat.icon} ${cat.name}`}>
                    {cat.children.map((child: any) => (
                      <option key={child.key} value={child.key}>{child.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <Err msg={errors.serviceTypeKey} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Weight (lbs) *</Label>
                <input
                  type="number" min="1"
                  value={form.weightLbs}
                  onChange={e => upd('weightLbs', e.target.value)}
                  placeholder="e.g. 500"
                  className={cn(INPUT, errors.weightLbs && INPUT_ERR)}
                />
                <Err msg={errors.weightLbs} />
              </div>
            </div>

            <div>
              <Label>Handling Requirements</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {HANDLING.map(opt => (
                  <button
                    key={opt} type="button"
                    onClick={() => toggleHandling(opt)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      form.handling.includes(opt)
                        ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)] text-[var(--color-teal)]'
                        : 'border-[var(--color-cream-dark)] text-[var(--color-text-muted)] hover:border-[var(--color-teal-light)]',
                    )}
                  >
                    {form.handling.includes(opt) && <Check size={10} className="mr-1 inline" />}{opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Special Instructions (optional)</Label>
              <textarea
                rows={3}
                value={form.instructions}
                onChange={e => upd('instructions', e.target.value)}
                placeholder="Delivery contact info, access codes, fragile areas, priority notes…"
                className={cn(INPUT, 'resize-none')}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: Route ── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Pickup */}
            <div className="rounded-lg border-l-2 border-[var(--color-teal)] pl-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-teal)]">Pickup</p>
              <div className="space-y-3">
                <div>
                  <Label>Address *</Label>
                  <div className="relative">
                    <input
                      value={form.pickupAddress}
                      onChange={e => { upd('pickupAddress', e.target.value); setForm(f => ({ ...f, pickupLat: undefined, pickupLng: undefined, pickupResolved: undefined, routeDistanceM: undefined, routeDurationS: undefined })); }}
                      onBlur={e => handleGeocode('pickup', e.target.value)}
                      placeholder="Street, City, State"
                      className={cn(INPUT, 'pr-8', errors.pickupAddress && INPUT_ERR)}
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {geocodingPickup && <Loader2 size={14} className="animate-spin text-[var(--color-teal)]" />}
                      {!geocodingPickup && form.pickupResolved && <Check size={14} className="text-[var(--color-teal)]" />}
                    </div>
                  </div>
                  {form.pickupResolved && !errors.pickupAddress && (
                    <p className="mt-0.5 truncate text-xs text-[var(--color-teal)]">✓ {form.pickupResolved}</p>
                  )}
                  <Err msg={errors.pickupAddress} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Pickup Date *</Label>
                    <input type="date" value={form.pickupDate} onChange={e => upd('pickupDate', e.target.value)} className={cn(INPUT, errors.pickupDate && INPUT_ERR)} />
                    <Err msg={errors.pickupDate} />
                  </div>
                  <div>
                    <Label>Time Window</Label>
                    <select value={form.pickupWindow} onChange={e => upd('pickupWindow', e.target.value)} className={INPUT}>
                      {WINDOWS.map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="rounded-lg border-l-2 border-[var(--color-slate)] pl-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-slate)]">Delivery</p>
              <div className="space-y-3">
                <div>
                  <Label>Address *</Label>
                  <div className="relative">
                    <input
                      value={form.deliveryAddress}
                      onChange={e => { upd('deliveryAddress', e.target.value); setForm(f => ({ ...f, deliveryLat: undefined, deliveryLng: undefined, deliveryResolved: undefined, routeDistanceM: undefined, routeDurationS: undefined })); }}
                      onBlur={e => handleGeocode('delivery', e.target.value)}
                      placeholder="Street, City, State"
                      className={cn(INPUT, 'pr-8', errors.deliveryAddress && INPUT_ERR)}
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {geocodingDelivery && <Loader2 size={14} className="animate-spin text-[var(--color-teal)]" />}
                      {!geocodingDelivery && form.deliveryResolved && <Check size={14} className="text-[var(--color-teal)]" />}
                    </div>
                  </div>
                  {form.deliveryResolved && !errors.deliveryAddress && (
                    <p className="mt-0.5 truncate text-xs text-[var(--color-teal)]">✓ {form.deliveryResolved}</p>
                  )}
                  <Err msg={errors.deliveryAddress} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Delivery Date *</Label>
                    <input type="date" value={form.deliveryDate} onChange={e => upd('deliveryDate', e.target.value)} className={cn(INPUT, errors.deliveryDate && INPUT_ERR)} />
                    <Err msg={errors.deliveryDate} />
                  </div>
                  <div>
                    <Label>Time Window</Label>
                    <select value={form.deliveryWindow} onChange={e => upd('deliveryWindow', e.target.value)} className={INPUT}>
                      {WINDOWS.map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Route summary */}
            {(routeLoading || form.routeDistanceM) && (
              <div className="rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-4 py-3">
                {routeLoading ? (
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-faint)]">
                    <Loader2 size={12} className="animate-spin" /> Calculating route…
                  </div>
                ) : (
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-teal)]">
                      <Ruler size={13} /> {fmtDist(form.routeDistanceM!)}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-teal)]">
                      <Clock size={13} /> {fmtTime(form.routeDurationS!)}
                    </div>
                    <p className="text-xs text-[var(--color-text-faint)]">estimated drive time</p>
                  </div>
                )}
              </div>
            )}

            {/* Mini map */}
            {form.pickupLat && form.deliveryLat && (
              <StaticRouteMap
                pickup={{ lat: form.pickupLat, lng: form.pickupLng! }}
                delivery={{ lat: form.deliveryLat, lng: form.deliveryLng! }}
                className="h-[180px] w-full rounded-xl overflow-hidden border border-[var(--color-cream-dark)]"
              />
            )}
          </div>
        )}

        {/* ── Step 2: Carrier + Receiver ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <Label>Receiver email (optional)</Label>
              <input
                type="email"
                value={form.receiverEmail}
                onChange={e => upd('receiverEmail', e.target.value)}
                placeholder="receiver@company.com"
                className={INPUT}
              />
              <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                The person receiving this delivery. They will get access to track the shipment.
              </p>
            </div>

            <div className="border-t border-[var(--color-cream-dark)] pt-4">
              <p className="text-sm text-[var(--color-text-faint)] mb-3">Select the carrier to assign this shipment to (optional — or post as open bid).</p>
            {(errors as any).carrierId && (
              <p className="text-xs text-red-500">{(errors as any).carrierId}</p>
            )}
            {MOCK_CARRIERS.map(c => {
              const selected = form.carrierId === c.id;
              return (
                <button
                  key={c.id} type="button"
                  onClick={() => upd('carrierId', c.id)}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-all',
                    selected
                      ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)] shadow-sm'
                      : 'border-[var(--color-cream-dark)] bg-[var(--color-white)] hover:border-[var(--color-teal-light)]',
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      selected ? 'bg-[var(--color-teal)] text-white' : 'bg-[var(--color-cream-dark)] text-[var(--color-text-muted)]',
                    )}>
                      {c.name.charAt(0)}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)]">{c.name}</p>
                      <p className="text-xs text-[var(--color-text-faint)] truncate">{c.company}</p>
                      <p className="text-xs text-[var(--color-text-faint)]">DOT #{c.dot}</p>
                    </div>
                    {/* Rating + check */}
                    <div className="shrink-0 flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-0.5 justify-end">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium text-[var(--color-text)]">{c.rating}</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-faint)]">{c.jobs} jobs</p>
                      </div>
                      {selected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-teal)]">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            </div>
          </div>
        )}

        {/* ── Step 3: Review + Cost ── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Details summary */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)]">Shipment Details</p>
              <div className="space-y-2 rounded-lg bg-[var(--color-cream)] p-4">
                {[
                  ['Description', form.description],
                  ['Category', form.category],
                  ['Weight', `${form.weightLbs} lbs`],
                  form.handling.length ? ['Handling', form.handling.join(', ')] : null,
                  form.instructions ? ['Notes', form.instructions] : null,
                ].filter((r): r is [string, string] => r !== null).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 text-sm">
                    <span className="text-[var(--color-text-faint)] shrink-0">{k}</span>
                    <span className="text-right text-[var(--color-text)] font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Route summary */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)]">Route</p>
              <div className="space-y-2 rounded-lg bg-[var(--color-cream)] p-4">
                {[
                  ['Pickup', form.pickupResolved ?? form.pickupAddress],
                  ['Pickup date', `${form.pickupDate} · ${form.pickupWindow}`],
                  ['Delivery', form.deliveryResolved ?? form.deliveryAddress],
                  ['Delivery date', `${form.deliveryDate} · ${form.deliveryWindow}`],
                  form.routeDistanceM ? ['Distance', `${fmtDist(form.routeDistanceM)} · ${fmtTime(form.routeDurationS!)}`] : null,
                ].filter((x): x is string[] => x !== null).map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-4 text-sm">
                    <span className="text-[var(--color-text-faint)] shrink-0">{k}</span>
                    <span className="text-right text-[var(--color-text)] font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carrier summary */}
            {carrier && (
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)]">Carrier</p>
                <div className="flex items-center gap-3 rounded-lg bg-[var(--color-cream)] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-teal)] text-sm font-semibold text-white">
                    {carrier.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{carrier.name}</p>
                    <p className="text-xs text-[var(--color-text-faint)]">{carrier.company}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{carrier.rating}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Cost */}
            <div>
              <Label>Agreed Shipment Cost (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-faint)]">$</span>
                <input
                  type="number" min="1" step="0.01"
                  value={form.cost}
                  onChange={e => upd('cost', e.target.value)}
                  placeholder="0.00"
                  className={cn(INPUT, 'pl-6', errors.cost && INPUT_ERR)}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-faint)]">The amount the carrier will be paid upon delivery confirmation.</p>
              <Err msg={errors.cost} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => step === 0 ? router.push('/shipper/shipments') : setStep(s => s - 1)}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors"
        >
          <ChevronLeft size={14} /> {step === 0 ? 'Cancel' : 'Back'}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={submitting}
          className={cn(
            'flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm disabled:opacity-60',
            step === STEPS.length - 1
              ? 'bg-[var(--color-teal)] hover:bg-[var(--color-teal-light)]'
              : 'bg-[var(--color-slate)] hover:bg-[var(--color-slate-80)]',
          )}
        >
          {submitting ? (
            <><Loader2 size={14} className="animate-spin" /> Creating…</>
          ) : step === STEPS.length - 1 ? (
            <><Navigation2 size={14} /> Create Shipment</>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
}

export default function NewShipmentPage() {
  return (
    <Suspense>
      <NewShipmentInner />
    </Suspense>
  );
}
