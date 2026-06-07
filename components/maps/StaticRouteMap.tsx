'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import type { GpsCoordinates } from '@/types/gps';

interface StaticRouteMapProps {
  pickup: GpsCoordinates;
  delivery: GpsCoordinates;
  routePolyline?: number[][];   // [[lng, lat], ...] from OSRM — real road route
  className?: string;
}

export function StaticRouteMap({
  pickup,
  delivery,
  routePolyline,
  className = 'h-[200px] w-full rounded-xl overflow-hidden',
}: StaticRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('maplibre-gl').then(async (ml) => {
      await import('maplibre-gl/dist/maplibre-gl.css' as any);

      // Use real road polyline if available, fall back to straight line
      const routeCoords: number[][] = routePolyline && routePolyline.length > 0
        ? routePolyline
        : [[pickup.lng, pickup.lat], [delivery.lng, delivery.lat]];

      // Compute bounds to auto-fit
      const lngs = routeCoords.map(c => c[0]);
      const lats  = routeCoords.map(c => c[1]);
      const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
      const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];

      const map = new ml.Map({
        container: containerRef.current!,
        style: process.env.NEXT_PUBLIC_MAPTILER_KEY && process.env.NEXT_PUBLIC_MAPTILER_KEY !== 'your-maptiler-key'
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
          : 'https://tiles.openfreemap.org/styles/liberty',
        bounds: [sw, ne],
        fitBoundsOptions: { padding: 40, maxZoom: 12 },
        interactive: false,
      });
      mapRef.current = map;

      map.on('load', () => {
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
          paint: { 'line-color': '#2A8C8A', 'line-width': 2 },
        });

        // Pickup pin (teal)
        const startEl = document.createElement('div');
        startEl.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#2A8C8A;border:2px solid #fff;';
        new ml.Marker({ element: startEl }).setLngLat([pickup.lng, pickup.lat]).addTo(map);

        // Delivery pin (dark)
        const endEl = document.createElement('div');
        endEl.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#0F1923;border:2px solid #fff;';
        new ml.Marker({ element: endEl }).setLngLat([delivery.lng, delivery.lat]).addTo(map);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [pickup.lat, pickup.lng, delivery.lat, delivery.lng]);

  return <div ref={containerRef} className={className} />;
}
