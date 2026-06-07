'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { getEcho } from '@/lib/echo';
import type { GpsCoordinates, GpsPingEvent } from '@/types/gps';
import { formatEta } from '@/lib/utils';

interface LiveMapProps {
  shipmentId: number;
  initialCoordinates: GpsCoordinates;
  pickupCoordinates: GpsCoordinates;
  deliveryCoordinates: GpsCoordinates;
  deliveryAddress: string;
  routePolyline?: number[][];   // [[lng, lat], ...] from OSRM — real road route
  eta?: string;
  className?: string;
}

export function LiveMap({
  shipmentId,
  initialCoordinates,
  pickupCoordinates,
  deliveryCoordinates,
  routePolyline,
  eta,
  className = 'h-[400px] w-full rounded-xl overflow-hidden',
}: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const animateMarker = useCallback((lat: number, lng: number) => {
    markerRef.current?.setLngLat([lng, lat]);
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let channel: any;

    import('maplibre-gl').then(async (ml) => {
      await import('maplibre-gl/dist/maplibre-gl.css' as any);

      const map = new ml.Map({
        container: containerRef.current!,
        style: process.env.NEXT_PUBLIC_MAPTILER_KEY && process.env.NEXT_PUBLIC_MAPTILER_KEY !== 'your-maptiler-key'
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
          : 'https://tiles.openfreemap.org/styles/liberty',
        center: [initialCoordinates.lng, initialCoordinates.lat],
        zoom: 8,
      });
      mapRef.current = map;

      map.on('load', () => {
        // Use real road polyline if available, fall back to straight line
        const routeCoords: number[][] = routePolyline && routePolyline.length > 0
          ? routePolyline
          : [
              [pickupCoordinates.lng, pickupCoordinates.lat],
              [initialCoordinates.lng, initialCoordinates.lat],
              [deliveryCoordinates.lng, deliveryCoordinates.lat],
            ];

        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: routeCoords },
          },
        });
        map.addLayer({
          id: 'route', type: 'line', source: 'route',
          paint: { 'line-color': '#2A8C8A', 'line-width': 3, 'line-dasharray': [2, 2] },
        });

        // Auto-fit to full route
        const lngs = routeCoords.map(c => c[0]);
        const lats  = routeCoords.map(c => c[1]);
        map.fitBounds(
          [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
          { padding: 60, maxZoom: 12 }
        );

        // Live GPS marker (teal pulsing dot)
        const el = document.createElement('div');
        el.style.cssText = `
          width:16px;height:16px;border-radius:50%;
          background:#2A8C8A;border:2px solid #fff;
          box-shadow:0 0 0 4px rgba(42,140,138,0.3);
        `;
        const gpsMarker = new ml.Marker({ element: el })
          .setLngLat([initialCoordinates.lng, initialCoordinates.lat])
          .addTo(map);
        markerRef.current = gpsMarker;

        // Pickup pin (teal)
        const startEl = document.createElement('div');
        startEl.style.cssText = 'width:12px;height:12px;border-radius:50%;background:#2A8C8A;border:2px solid #fff;';
        new ml.Marker({ element: startEl })
          .setLngLat([pickupCoordinates.lng, pickupCoordinates.lat])
          .addTo(map);

        // Delivery pin (dark)
        const endEl = document.createElement('div');
        endEl.style.cssText = 'width:12px;height:12px;border-radius:50%;background:#0F1923;border:2px solid #fff;';
        new ml.Marker({ element: endEl })
          .setLngLat([deliveryCoordinates.lng, deliveryCoordinates.lat])
          .addTo(map);
      });

      // Subscribe to live GPS events
      const echo = getEcho();
      channel = echo.private(`shipment.${shipmentId}`);
      channel.listen('GpsPingReceived', (e: GpsPingEvent) => {
        animateMarker(e.lat, e.lng);
        if (e.state_crossed) {
          toast(`Carrier crossed into ${e.state_crossed}${e.eta ? ` · ETA updated to ${formatEta(e.eta)}` : ''}`, { duration: 4000 });
        }
      });
    });

    return () => {
      channel?.stopListening('GpsPingReceived');
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
      {eta && (
        <div className="absolute right-3 top-3 rounded-lg bg-[var(--color-slate)] px-3 py-1.5 text-xs font-medium text-white shadow">
          ETA {formatEta(eta)}
        </div>
      )}
    </div>
  );
}
