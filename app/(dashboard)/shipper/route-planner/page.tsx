'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, X, Navigation2, Clock, Ruler, ChevronDown,
  ChevronUp, Loader2, MapPin, GripVertical, RotateCcw, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stop {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
  resolved?: string; // display name from geocoder
  error?: boolean;
}

interface RouteLeg {
  fromLabel: string;
  toLabel: string;
  distance: number; // metres
  duration: number; // seconds
}

interface RouteResult {
  legs: RouteLeg[];
  totalDistance: number; // metres
  totalDuration: number; // seconds
  geometry: [number, number][]; // [lng, lat][]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDistance(m: number) {
  const mi = m * 0.000621371;
  return mi >= 1 ? `${mi.toFixed(1)} mi` : `${Math.round(m)} m`;
}

function fmtDuration(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h}h ${m}m`;
}

function stopLabel(index: number, total: number) {
  if (index === 0) return 'Origin';
  if (index === total - 1 && total > 2) return 'Final stop';
  return `Stop ${index}`;
}

function markerLetter(index: number) {
  return String.fromCharCode(65 + index); // A, B, C …
}

// ─── Geocoding (Nominatim) ────────────────────────────────────────────────────
// Production: this call moves to Laravel → Google Places API

async function geocode(address: string): Promise<{ lat: number; lng: number; display: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=0`,
      { headers: { 'User-Agent': 'Shipmater/1.0 route-planner' } },
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
  } catch {
    return null;
  }
}

// ─── Routing (OSRM public) ────────────────────────────────────────────────────
// Production: POST /api/v1/routes/plan → Laravel → Google Directions API

async function fetchRoute(
  waypoints: { lat: number; lng: number; label: string }[],
): Promise<RouteResult> {
  const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Routing service unavailable');
  const data = await res.json();
  if (data.code !== 'Ok') throw new Error(`No route found (${data.code})`);

  const r = data.routes[0];
  return {
    totalDistance: r.distance,
    totalDuration: r.duration,
    geometry: r.geometry.coordinates as [number, number][],
    legs: r.legs.map((leg: any, i: number) => ({
      fromLabel: waypoints[i].label,
      toLabel: waypoints[i + 1].label,
      distance: leg.distance,
      duration: leg.duration,
    })),
  };
}

// ─── Map component ────────────────────────────────────────────────────────────

function RoutePlannerMap({
  stops,
  result,
}: {
  stops: Stop[];
  result: RouteResult | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mapReadyRef = useRef(false);

  // Keep refs in sync so applyUpdate always reads the latest values
  const latestStopsRef = useRef(stops);
  const latestResultRef = useRef(result);
  latestStopsRef.current = stops;
  latestResultRef.current = result;

  // Core update: draws markers + route, then fits bounds
  const applyUpdate = useCallback((ml: any) => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const geocodedStops = latestStopsRef.current.filter(s => s.lat !== undefined && s.lng !== undefined);
    const currentResult = latestResultRef.current;

    geocodedStops.forEach((stop, i) => {
      const letter = markerLetter(i);
      const isOrigin = i === 0;
      const el = document.createElement('div');
      el.style.cssText = `
        width:32px;height:32px;border-radius:50%;
        background:${isOrigin ? '#0F1923' : '#2A8C8A'};
        border:3px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-size:13px;font-weight:600;
        font-family:var(--font-body);cursor:default;
      `;
      el.textContent = letter;
      markersRef.current.push(new ml.Marker({ element: el }).setLngLat([stop.lng!, stop.lat!]).addTo(map));
    });

    const routeSource = map.getSource('route') as any;
    if (routeSource) {
      routeSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: currentResult ? currentResult.geometry : [],
        },
      });
    }

    if (geocodedStops.length >= 2) {
      const lngs = geocodedStops.map(s => s.lng!);
      const lats = geocodedStops.map(s => s.lat!);
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 80, maxZoom: 12, duration: 800 },
      );
    } else if (geocodedStops.length === 1) {
      map.flyTo({ center: [geocodedStops[0].lng!, geocodedStops[0].lat!], zoom: 10 });
    }
  }, []);

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('maplibre-gl').then(async (ml) => {
      await import('maplibre-gl/dist/maplibre-gl.css' as any);

      const map = new ml.Map({
        container: containerRef.current!,
        style: process.env.NEXT_PUBLIC_MAPTILER_KEY && process.env.NEXT_PUBLIC_MAPTILER_KEY !== 'your-maptiler-key'
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
          : 'https://tiles.openfreemap.org/styles/liberty',
        center: [-98.5795, 39.8283], // US centre
        zoom: 3.5,
      });
      mapRef.current = map;

      map.on('load', () => {
        mapReadyRef.current = true;

        // Route source + layers (empty to start)
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
        });
        // White casing behind the teal line
        map.addLayer({
          id: 'route-casing',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#ffffff', 'line-width': 7, 'line-opacity': 0.5 },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
        });
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#2A8C8A', 'line-width': 4, 'line-opacity': 0.9 },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
        });

        // Apply any update that arrived before the map was ready
        applyUpdate(ml);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
    };
  }, [applyUpdate]);

  // Re-apply whenever stops or result change (map must be ready)
  useEffect(() => {
    if (!mapReadyRef.current) return;
    import('maplibre-gl').then((ml) => applyUpdate(ml));
  }, [stops, result, applyUpdate]);

  return <div ref={containerRef} className="h-full w-full" />;
}

// ─── Main page ────────────────────────────────────────────────────────────────

let idCounter = 0;
function uid() { return `stop-${++idCounter}`; }

export default function RoutePlannerPage() {
  const router = useRouter();
  const [stops, setStops] = useState<Stop[]>([
    { id: uid(), address: '' },
    { id: uid(), address: '' },
  ]);
  const [planning, setPlanning] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [expandedLeg, setExpandedLeg] = useState<number | null>(null);
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  // ── Stop management ────────────────────────────────────────────────────────

  function updateAddress(id: string, value: string) {
    setStops(prev => prev.map(s => s.id === id ? { ...s, address: value, lat: undefined, lng: undefined, resolved: undefined, error: false } : s));
    setResult(null);
  }

  function addStop() {
    setStops(prev => [...prev, { id: uid(), address: '' }]);
    setResult(null);
  }

  function removeStop(id: string) {
    setStops(prev => {
      const next = prev.filter(s => s.id !== id);
      return next.length >= 2 ? next : prev;
    });
    setResult(null);
  }

  function reset() {
    setStops([{ id: uid(), address: '' }, { id: uid(), address: '' }]);
    setResult(null);
  }

  // ── Drag-to-reorder ────────────────────────────────────────────────────────

  function handleDragStart(i: number) { setDragSrc(i); }
  function handleDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOver(i); }
  function handleDrop(i: number) {
    if (dragSrc === null || dragSrc === i) { setDragSrc(null); setDragOver(null); return; }
    const next = [...stops];
    const [item] = next.splice(dragSrc, 1);
    next.splice(i, 0, item);
    setStops(next);
    setResult(null);
    setDragSrc(null);
    setDragOver(null);
  }
  function handleDragEnd() { setDragSrc(null); setDragOver(null); }

  // ── Use in shipment ────────────────────────────────────────────────────────

  function useInShipment() {
    const geocoded = stops.filter(s => s.lat !== undefined);
    if (geocoded.length < 2) { toast.error('Plan the route first.'); return; }
    const origin = geocoded[0];
    const dest   = geocoded[geocoded.length - 1];
    const params = new URLSearchParams({
      pickup:      origin.resolved ?? origin.address,
      pickupLat:   String(origin.lat!),
      pickupLng:   String(origin.lng!),
      delivery:    dest.resolved   ?? dest.address,
      deliveryLat: String(dest.lat!),
      deliveryLng: String(dest.lng!),
    });
    if (result) {
      params.set('distanceM', String(Math.round(result.totalDistance)));
      params.set('durationS',  String(Math.round(result.totalDuration)));
    }
    router.push(`/shipper/shipments/new?${params}`);
  }

  // ── Plan ──────────────────────────────────────────────────────────────────

  async function handlePlan() {
    const filled = stops.filter(s => s.address.trim().length > 0);
    if (filled.length < 2) {
      toast.error('Enter at least an origin and one destination.');
      return;
    }

    setPlanning(true);
    setResult(null);

    // Geocode all filled stops
    const geocoded: Stop[] = [...stops];
    let anyFailed = false;

    for (let i = 0; i < geocoded.length; i++) {
      const s = geocoded[i];
      if (!s.address.trim()) continue;
      const geo = await geocode(s.address);
      if (!geo) {
        geocoded[i] = { ...s, error: true };
        anyFailed = true;
        toast.error(`Address not found: "${s.address}"`);
      } else {
        geocoded[i] = { ...s, lat: geo.lat, lng: geo.lng, resolved: geo.display, error: false };
      }
    }

    setStops(geocoded);

    if (anyFailed) { setPlanning(false); return; }

    const waypoints = geocoded
      .filter(s => s.lat !== undefined)
      .map((s, i) => ({ lat: s.lat!, lng: s.lng!, label: markerLetter(i) }));

    try {
      const route = await fetchRoute(waypoints);
      setResult(route);
      toast.success(`Route planned · ${fmtDistance(route.totalDistance)} · ${fmtDuration(route.totalDuration)}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Route planning failed.');
    } finally {
      setPlanning(false);
    }
  }

  const canPlan = stops.filter(s => s.address.trim()).length >= 2;

  return (
    // Break out of the dashboard p-6 padding and take full height
    <div className="-m-6 flex h-[calc(100vh-56px)] overflow-hidden">

      {/* ── Left panel ── */}
      <div className="flex w-[360px] shrink-0 flex-col border-r border-[var(--color-cream-dark)] bg-[var(--color-white)] overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--color-cream-dark)]">
          <div className="flex items-center justify-between">
            <h1 className="text-xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
              Route Planner
            </h1>
            {result && (
              <button onClick={reset} className="flex items-center gap-1 text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors">
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>
          <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">Plan the most efficient multi-stop route</p>
        </div>

        {/* Stops form */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {stops.map((stop, i) => {
            const isOrigin = i === 0;
            const isLast   = i === stops.length - 1;
            const letter   = markerLetter(i);
            const isDragging  = dragSrc === i;
            const isDropTarget = dragOver === i && dragSrc !== i;

            return (
              <div
                key={stop.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={e => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'rounded-lg transition-all',
                  isDragging   && 'opacity-40',
                  isDropTarget && 'ring-2 ring-[var(--color-teal)] ring-offset-1',
                )}
              >
                <div className="flex items-center gap-2 group relative">
                  {/* Connector line (between stops) */}
                  {!isLast && (
                    <div className="absolute left-[23px] top-[38px] h-[calc(100%+6px)] w-[2px] bg-[var(--color-cream-dark)] z-0" />
                  )}

                  {/* Drag grip */}
                  <div className="shrink-0 cursor-grab active:cursor-grabbing text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors">
                    <GripVertical size={14} />
                  </div>

                  {/* Marker dot */}
                  <div
                    className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm"
                    style={{ background: isOrigin ? 'var(--color-slate)' : 'var(--color-teal)' }}
                  >
                    {letter}
                  </div>

                  {/* Address input */}
                  <div className="flex-1 relative">
                    <input
                      value={stop.address}
                      onChange={e => updateAddress(stop.id, e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePlan()}
                      placeholder={isOrigin ? 'Starting address…' : `Drop-off address ${i}…`}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors',
                        'bg-[var(--color-cream)] border',
                        stop.error
                          ? 'border-[var(--color-danger)] bg-red-50 text-[var(--color-danger)]'
                          : stop.resolved
                            ? 'border-[var(--color-teal)] text-[var(--color-text)]'
                            : 'border-[var(--color-cream-dark)] text-[var(--color-text)]',
                        'placeholder:text-[var(--color-text-faint)]',
                        'focus:border-[var(--color-teal)]',
                      )}
                    />
                    {stop.resolved && !stop.error && (
                      <p className="mt-0.5 truncate px-1 text-xs text-[var(--color-teal)]">
                        ✓ {stop.resolved.split(',').slice(0, 2).join(',')}
                      </p>
                    )}
                    {stop.error && (
                      <p className="mt-0.5 px-1 text-xs text-[var(--color-danger)]">Address not found</p>
                    )}
                  </div>

                  {/* Remove button (min 2 stops) */}
                  {stops.length > 2 && (
                    <button
                      onClick={() => removeStop(stop.id)}
                      className="shrink-0 rounded-md p-1 text-[var(--color-text-faint)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--color-danger)] transition-colors"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                {/* Gap between stops */}
                {!isLast && <div className="h-2" />}
              </div>
            );
          })}

          {/* Add stop */}
          <div className="pt-3">
            <button
              onClick={addStop}
              disabled={stops.length >= 10}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-[var(--color-cream-dark)] px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] disabled:opacity-40 transition-colors"
            >
              <Plus size={13} /> Add another stop
            </button>
          </div>

          {/* Plan button */}
          <div className="pt-3">
            <button
              onClick={handlePlan}
              disabled={!canPlan || planning}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-teal)] py-3 text-sm font-semibold text-white hover:bg-[var(--color-teal-light)] disabled:opacity-50 transition-colors shadow-sm"
            >
              {planning ? (
                <><Loader2 size={15} className="animate-spin" /> Planning route…</>
              ) : (
                <><Navigation2 size={15} /> PLAN ROUTE</>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-[var(--color-text-faint)]">
              Powered by OSRM · Production uses Google Directions
            </p>
          </div>

          {/* ── Results ── */}
          {result && (
            <div className="pt-4 space-y-3">
              <div className="h-px bg-[var(--color-cream-dark)]" />

              {/* Summary */}
              <div className="rounded-xl bg-[var(--color-teal-pale)] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-teal)] mb-2">Route Summary</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-teal)]">
                    <Ruler size={13} />
                    {fmtDistance(result.totalDistance)}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-teal)]">
                    <Clock size={13} />
                    {fmtDuration(result.totalDuration)}
                  </div>
                  <div className="text-sm text-[var(--color-teal)] opacity-70">
                    {result.legs.length} leg{result.legs.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Legs */}
              <div className="space-y-2">
                {result.legs.map((leg, i) => (
                  <button
                    key={i}
                    onClick={() => setExpandedLeg(expandedLeg === i ? null : i)}
                    className="w-full rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-3 text-left hover:border-[var(--color-teal-light)] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-slate)] text-xs font-bold text-white">
                          {leg.fromLabel}
                        </div>
                        <span className="text-[var(--color-text-faint)] text-xs">→</span>
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-teal)] text-xs font-bold text-white">
                          {leg.toLabel}
                        </div>
                        <span className="truncate text-sm text-[var(--color-text-muted)]">
                          {fmtDistance(leg.distance)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-[var(--color-text-faint)]">{fmtDuration(leg.duration)}</span>
                        {expandedLeg === i ? <ChevronUp size={12} className="text-[var(--color-text-faint)]" /> : <ChevronDown size={12} className="text-[var(--color-text-faint)]" />}
                      </div>
                    </div>
                    {expandedLeg === i && (
                      <div className="mt-3 border-t border-[var(--color-cream-dark)] pt-3 space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-faint)]">Distance</span>
                          <span className="font-medium text-[var(--color-text)]">{fmtDistance(leg.distance)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-faint)]">Drive time</span>
                          <span className="font-medium text-[var(--color-text)]">{fmtDuration(leg.duration)}</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Use in shipment CTA */}
              <button
                onClick={useInShipment}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-slate)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-slate-80)] transition-colors shadow-sm"
              >
                <ArrowRight size={14} /> Use this route in a shipment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Map panel ── */}
      <div className="relative flex-1">
        <RoutePlannerMap stops={stops} result={result} />

        {/* Empty state overlay */}
        {!result && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-8">
            <div className="flex items-center gap-2 rounded-full bg-[var(--color-slate)]/80 px-4 py-2 backdrop-blur-sm">
              <MapPin size={13} className="text-[var(--color-teal-light)]" />
              <p className="text-sm text-white/80">Enter addresses and click <span className="font-semibold text-white">PLAN ROUTE</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
