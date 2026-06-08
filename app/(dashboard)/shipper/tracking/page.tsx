'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Navigation, Truck, User } from 'lucide-react';
import { shipmentApi } from '@/lib/api';
import { getEcho, disconnectEcho, type PingPayload } from '@/lib/echo';
import type { Shipment, GpsPingData } from '@/types/shipment';

// ── Route helpers ─────────────────────────────────────────────────────────────

/** Project point P onto segment AB, return closest point + t ∈ [0,1] */
function projectOnSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): { x: number; y: number; t: number } {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { x: ax, y: ay, t: 0 };
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return { x: ax + t * dx, y: ay + t * dy, t };
}

/**
 * Slice route coordinates from start to the point on the polyline
 * nearest to `truck`. Returns the road-following completed-leg coords.
 */
function sliceRouteToTruck(
  route: [number, number][],   // [lng, lat][]
  truck: { lat: number; lng: number },
): [number, number][] {
  if (route.length < 2) return [];
  let bestDist = Infinity;
  let bestIdx  = 0;
  let bestPt: [number, number] = route[0];

  for (let i = 0; i < route.length - 1; i++) {
    const [ax, ay] = route[i];
    const [bx, by] = route[i + 1];
    const { x, y } = projectOnSegment(truck.lng, truck.lat, ax, ay, bx, by);
    const d = (x - truck.lng) ** 2 + (y - truck.lat) ** 2;
    if (d < bestDist) { bestDist = d; bestIdx = i; bestPt = [x, y]; }
  }

  return [...route.slice(0, bestIdx + 1), bestPt];
}

/** Fetch real road geometry from the OSRM public demo server */
async function fetchOsrmRoute(
  pickup: { lat: number; lng: number },
  delivery: { lat: number; lng: number },
): Promise<[number, number][] | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${pickup.lng},${pickup.lat};${delivery.lng},${delivery.lat}` +
      `?overview=full&geometries=geojson`;
    const res  = await fetch(url);
    const json = await res.json();
    const coords = json?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
    return coords && coords.length > 1 ? coords : null;
  } catch {
    return null;
  }
}

// ── fitAll ────────────────────────────────────────────────────────────────────

function fitAll(
  map: any,
  pickup:   { lat: number; lng: number } | null,
  delivery: { lat: number; lng: number } | null,
  ping:     GpsPingData | null,
) {
  const pts: [number, number][] = [];
  if (pickup)   pts.push([pickup.lng,   pickup.lat]);
  if (delivery) pts.push([delivery.lng, delivery.lat]);
  if (ping)     pts.push([ping.lng,     ping.lat]);
  if (pts.length < 2) return;
  const lngs = pts.map((p) => p[0]);
  const lats  = pts.map((p) => p[1]);
  map.fitBounds(
    [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
    { padding: 110, maxZoom: 14, duration: 800 },
  );
}

// ── LiveMap ───────────────────────────────────────────────────────────────────

function LiveMap({ shipment }: { shipment: Shipment }) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<any>(null);
  const mlRef         = useRef<any>(null);
  const truckRef      = useRef<any>(null);
  const pickupRef     = useRef<{ lat: number; lng: number } | null>(null);
  const routeRef      = useRef<[number, number][]>([]);   // real road coords once fetched
  const [routeState, setRouteState] = useState<'loading' | 'ready' | 'fallback'>('loading');

  const ping     = shipment.latest_ping ?? null;
  const pickup   = shipment.pickup_lat  && shipment.pickup_lng
    ? { lat: shipment.pickup_lat,   lng: shipment.pickup_lng   } : null;
  const delivery = shipment.delivery_lat && shipment.delivery_lng
    ? { lat: shipment.delivery_lat, lng: shipment.delivery_lng } : null;

  pickupRef.current = pickup;

  // ── Mount: init map ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Animation CSS (inject once)
    const styleId = 'shipmater-live-map-css';
    if (!document.getElementById(styleId)) {
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = `
        @keyframes sm_ring  { 0%{transform:scale(.8);opacity:.8} 100%{transform:scale(2.4);opacity:0} }
        @keyframes sm_pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        .sm-truck-wrap { position:relative;width:44px;height:44px; }
        .sm-truck-ring { position:absolute;inset:0;border-radius:50%;
                         background:rgba(42,140,138,.3);
                         animation:sm_ring 2s ease-out infinite; }
        .sm-truck-body { position:absolute;inset:5px;border-radius:50%;
                         background:#2A8C8A;border:2.5px solid #fff;
                         display:flex;align-items:center;justify-content:center;
                         font-size:15px;
                         animation:sm_pulse 2s ease-in-out infinite;
                         box-shadow:0 3px 10px rgba(42,140,138,.55); }
      `;
      document.head.appendChild(s);
    }

    const defaultCenter: [number, number] = ping
      ? [ping.lng, ping.lat]
      : pickup ? [pickup.lng, pickup.lat]
      : [-98.5795, 39.8283];

    import('maplibre-gl').then(async (ml) => {
      await import('maplibre-gl/dist/maplibre-gl.css' as any);
      if (!containerRef.current) return;

      const map = new ml.Map({
        container: containerRef.current,
        style:
          process.env.NEXT_PUBLIC_MAPTILER_KEY &&
          process.env.NEXT_PUBLIC_MAPTILER_KEY !== 'your-maptiler-key'
            ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
            : 'https://tiles.openfreemap.org/styles/liberty',
        center: defaultCenter,
        zoom: 7,
      });

      mapRef.current = map;
      mlRef.current  = ml;

      map.on('load', async () => {
        // ── Straight-line fallback sources (shown instantly) ───────
        const straightLine = pickup && delivery
          ? [[pickup.lng, pickup.lat], [delivery.lng, delivery.lat]] as [number, number][]
          : [];

        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: straightLine } },
        });
        map.addLayer({
          id: 'route-dashed', type: 'line', source: 'route',
          paint: { 'line-color': '#CBD5E1', 'line-width': 2.5, 'line-dasharray': [5, 4] },
        });

        const initialCompleted = ping && pickup
          ? [[pickup.lng, pickup.lat], [ping.lng, ping.lat]] as [number, number][]
          : [];
        map.addSource('completed', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: initialCompleted } },
        });
        map.addLayer({
          id: 'completed-leg', type: 'line', source: 'completed',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#2A8C8A', 'line-width': 4 },
        });

        // ── Pickup / delivery markers ──────────────────────────────
        if (pickup && delivery) {
          const mkEl = (label: string, bg: string) => {
            const el = document.createElement('div');
            el.innerHTML = `
              <div style="display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none">
                <div style="background:${bg};color:#fff;padding:2px 8px;border-radius:5px;
                            font-size:11px;font-weight:700;white-space:nowrap;
                            font-family:system-ui,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.2)">${label}</div>
                <div style="width:11px;height:11px;border-radius:50%;background:${bg};
                            border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25)"></div>
              </div>`;
            return el;
          };
          new ml.Marker({ element: mkEl('Pickup',   '#1B6B69'), anchor: 'bottom' }).setLngLat([pickup.lng,   pickup.lat]).addTo(map);
          new ml.Marker({ element: mkEl('Delivery', '#0F1923'), anchor: 'bottom' }).setLngLat([delivery.lng, delivery.lat]).addTo(map);
        }

        // ── Truck marker ───────────────────────────────────────────
        if (ping) {
          const truckEl = document.createElement('div');
          truckEl.className = 'sm-truck-wrap';
          truckEl.innerHTML = `<div class="sm-truck-ring"></div><div class="sm-truck-body">🚚</div>`;
          truckRef.current = new ml.Marker({ element: truckEl, anchor: 'center' })
            .setLngLat([ping.lng, ping.lat]).addTo(map);
        }

        fitAll(map, pickup, delivery, ping);

        // ── Fetch real road route from OSRM ────────────────────────
        if (pickup && delivery) {
          const roadCoords = await fetchOsrmRoute(pickup, delivery);
          if (roadCoords && mapRef.current) {
            routeRef.current = roadCoords;
            setRouteState('ready');

            // Replace straight line with real road
            (map.getSource('route') as any)?.setData({
              type: 'Feature', properties: {},
              geometry: { type: 'LineString', coordinates: roadCoords },
            });

            // Re-draw completed leg along the road
            if (ping) {
              const sliced = sliceRouteToTruck(roadCoords, ping);
              (map.getSource('completed') as any)?.setData({
                type: 'Feature', properties: {},
                geometry: { type: 'LineString', coordinates: sliced },
              });
            }
          } else {
            setRouteState('fallback');
          }
        }
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current  = null;
      truckRef.current = null;
      routeRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update truck + completed leg on new ping ────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ping || !map.isStyleLoaded()) return;

    const pu    = pickupRef.current;
    const route = routeRef.current;

    // Completed leg — road-following if we have the route, else straight
    const completedCoords =
      route.length > 1 && pu
        ? sliceRouteToTruck(route, ping)
        : pu ? [[pu.lng, pu.lat], [ping.lng, ping.lat]] as [number, number][]
        : [];

    (map.getSource('completed') as any)?.setData({
      type: 'Feature', properties: {},
      geometry: { type: 'LineString', coordinates: completedCoords },
    });

    // Slide truck marker
    if (truckRef.current) {
      truckRef.current.setLngLat([ping.lng, ping.lat]);
    } else if (mlRef.current) {
      const el = document.createElement('div');
      el.className = 'sm-truck-wrap';
      el.innerHTML = `<div class="sm-truck-ring"></div><div class="sm-truck-body">🚚</div>`;
      truckRef.current = new mlRef.current.Marker({ element: el, anchor: 'center' })
        .setLngLat([ping.lng, ping.lat]).addTo(map);
    }
  }, [ping?.lat, ping?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Shipment chip — top-left */}
      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 shadow-md pointer-events-none">
        <span className="text-sm font-semibold text-[var(--color-text)]">{shipment.item_description}</span>
        <span className="rounded-full bg-[var(--color-teal-pale)] px-2 py-0.5 text-xs font-mono text-[var(--color-teal)]">
          #{shipment.tracking_token}
        </span>
      </div>

      {/* Live badge + route status — top-right */}
      <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
        {routeState === 'loading' && pickup && delivery && (
          <div className="flex items-center gap-1.5 rounded-lg bg-white/85 backdrop-blur-sm px-2.5 py-1.5 shadow-sm">
            <div className="h-3 w-3 rounded-full border-2 border-[var(--color-teal)] border-t-transparent animate-spin" />
            <span className="text-xs text-[var(--color-text-faint)]">Loading route…</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 shadow-md">
          <span className="h-2 w-2 rounded-full bg-[var(--color-teal)] animate-pulse" />
          <span className="text-xs font-bold text-[var(--color-teal)] tracking-wide">LIVE · 5s</span>
        </div>
      </div>

      {/* No GPS overlay */}
      {!ping && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
          <div className="rounded-2xl bg-white/95 px-8 py-6 text-center shadow-xl">
            <Navigation size={32} className="mx-auto mb-3 text-[var(--color-text-faint)]" />
            <p className="text-base font-semibold text-[var(--color-text)]">No GPS ping yet</p>
            <p className="mt-1 text-sm text-[var(--color-text-faint)]">Waiting for carrier to transmit location</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LiveTrackingPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const channelRef = useRef<any>(null);

  const { data: listRes, isLoading: listLoading } = useQuery({
    queryKey:        ['shipper-shipments'],
    queryFn:         () => shipmentApi.list(),
    refetchInterval: 30_000,
  });

  const allShipments: Shipment[] = listRes?.data?.data ?? [];
  const active = allShipments.filter((s) => s.status === 'in_transit');

  // Auto-select first active shipment once list loads
  useEffect(() => {
    if (active.length > 0 && selectedId === null) setSelectedId(active[0].id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.length]);

  // Fetch shipment detail once — WebSocket keeps it live
  const { data: detailRes } = useQuery({
    queryKey: ['live-shipment', selectedId],
    queryFn:  () => shipmentApi.get(selectedId!),
    enabled:  selectedId !== null,
    // Fallback poll every 30s if WebSocket isn't available
    refetchInterval: 30_000,
  });

  // ── Subscribe to Reverb WebSocket when a shipment is selected ──────
  useEffect(() => {
    // Leave previous channel synchronously before async setup
    if (channelRef.current) {
      channelRef.current.stopListening('.GpsPingReceived');
      channelRef.current = null;
    }
    if (!selectedId) return;

    let destroyed = false;

    (async () => {
      try {
        const echo = await getEcho();
        if (destroyed) return;

        const channel = echo.private(`shipment.${selectedId}`);
        // broadcastAs() = 'GpsPingReceived' — leading dot bypasses Laravel namespace
        channel.listen('.GpsPingReceived', (payload: PingPayload) => {
          // Inject the new ping directly into the query cache — no round-trip needed
          qc.setQueryData(['live-shipment', selectedId], (old: any) => {
            if (!old?.data?.data) return old;
            return {
              ...old,
              data: {
                ...old.data,
                data: {
                  ...old.data.data,
                  latest_ping: payload,
                  status: old.data.data.status === 'assigned' ? 'in_transit' : old.data.data.status,
                },
              },
            };
          });
        });
        channelRef.current = channel;
      } catch {
        // Reverb not running — fallback to polling (already set above)
      }
    })();

    return () => {
      destroyed = true;
      if (channelRef.current) {
        channelRef.current.stopListening('.GpsPingReceived');
        channelRef.current = null;
      }
    };
  }, [selectedId]); // eslint-disable-line

  // Disconnect Echo on unmount
  useEffect(() => () => disconnectEcho(), []);

  const liveShipment: Shipment | undefined = detailRes?.data?.data;
  const ping = liveShipment?.latest_ping ?? null;

  return (
    <div className="-m-6 flex h-[calc(100vh-56px)] overflow-hidden">

      {/* ════ LEFT PANEL ═══════════════════════════════════════════════ */}
      <div className="w-[380px] shrink-0 flex flex-col bg-[var(--color-cream)] border-r border-[var(--color-cream-dark)] overflow-hidden">

        <div className="shrink-0 border-b border-[var(--color-cream-dark)] bg-[var(--color-white)] px-5 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-[var(--color-slate)]">Live Tracking</h1>
            {active.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-teal-pale)] px-2.5 py-1 text-xs font-bold text-[var(--color-teal)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal)] animate-pulse" />
                {active.length} active
              </div>
            )}
          </div>
          <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">Map updates every 5 seconds</p>
        </div>

        {/* Shipment list */}
        <div className="flex-1 overflow-y-auto space-y-2 px-3 py-3">
          {listLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-[78px] rounded-xl bg-[var(--color-cream-dark)] animate-pulse" />
            ))
          ) : active.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-teal-pale)]">
                <Truck size={22} className="text-[var(--color-teal)]" />
              </div>
              <p className="font-semibold text-[var(--color-text)]">No active shipments</p>
              <p className="mt-1 text-sm text-[var(--color-text-faint)] max-w-[200px]">
                GPS tracking appears once a carrier is en route
              </p>
            </div>
          ) : (
            active.map((s) => {
              const isSelected = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)] shadow-sm'
                      : 'border-[var(--color-cream-dark)] bg-[var(--color-white)] hover:border-[var(--color-teal)]'
                  }`}
                >
                  <div className={`flex items-start gap-3 p-3.5 ${isSelected ? 'border-l-[3px] border-l-[var(--color-teal)] rounded-l-xl' : ''}`}>
                    <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-teal-pale)] text-lg">
                      🚚
                      {s.latest_ping && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--color-teal)] animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">{s.item_description}</p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-faint)] truncate">
                        {s.pickup_city ?? s.pickup_address} → {s.delivery_city ?? s.delivery_address}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="rounded-full bg-[var(--color-teal-pale)] border border-[var(--color-teal-light)] px-2 py-0.5 text-xs font-semibold text-[var(--color-teal)]">
                          In Transit
                        </span>
                        {s.latest_ping?.eta && (
                          <span className="text-xs text-[var(--color-text-muted)]">ETA {s.latest_ping.eta}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Info panel */}
        {liveShipment && (
          <div className="shrink-0 border-t border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-4 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={12} className="text-[var(--color-teal)]" />
                <span className="text-xs font-bold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Route</span>
              </div>
              <div className="space-y-1 pl-1">
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-teal)]" />
                  <p className="text-xs text-[var(--color-text)] leading-relaxed">{liveShipment.pickup_address}</p>
                </div>
                <div className="ml-[3px] h-4 w-px bg-[var(--color-cream-dark)]" />
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-slate)]" />
                  <p className="text-xs text-[var(--color-text)] leading-relaxed">{liveShipment.delivery_address}</p>
                </div>
              </div>
            </div>

            {ping ? (
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[var(--color-cream)] px-2 py-2.5 text-center">
                  <p className="text-xs text-[var(--color-text-faint)]">Speed</p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--color-text)]">
                    {ping.speed != null ? `${ping.speed} mph` : '—'}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--color-cream)] px-2 py-2.5 text-center">
                  <p className="text-xs text-[var(--color-text-faint)]">ETA</p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--color-text)]">{ping.eta ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-[var(--color-cream)] px-2 py-2.5 text-center">
                  <p className="text-xs text-[var(--color-text-faint)]">Updated</p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--color-text)]">
                    {new Date(ping.pinged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-[var(--color-cream)] px-3 py-2.5 text-center">
                <p className="text-xs text-[var(--color-text-faint)]">Waiting for first GPS ping…</p>
              </div>
            )}

            {liveShipment.carrier && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-cream-dark)]">
                  <User size={14} className="text-[var(--color-text-muted)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate">{liveShipment.carrier.name}</p>
                  {liveShipment.carrier.carrier_profile?.company_name && (
                    <p className="text-xs text-[var(--color-text-faint)] truncate">
                      {liveShipment.carrier.carrier_profile.company_name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════ MAP PANEL ════════════════════════════════════════════════ */}
      <div className="relative flex-1 bg-[var(--color-cream-dark)]">
        {selectedId && liveShipment ? (
          <LiveMap key={selectedId} shipment={liveShipment} />
        ) : !listLoading && active.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 text-6xl">🗺️</div>
            <p className="text-lg font-semibold text-[var(--color-text-muted)]">No shipments in transit</p>
            <p className="mt-1.5 text-sm text-[var(--color-text-faint)]">
              The live map will show truck positions as shipments move
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-[3px] border-[var(--color-teal)] border-t-transparent animate-spin" />
              <p className="text-sm text-[var(--color-text-faint)]">Loading map…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
