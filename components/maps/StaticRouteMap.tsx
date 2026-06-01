'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import type { GpsCoordinates } from '@/types/gps';

interface StaticRouteMapProps {
  pickup: GpsCoordinates;
  delivery: GpsCoordinates;
  className?: string;
}

export function StaticRouteMap({ pickup, delivery, className = 'h-[200px] w-full rounded-xl overflow-hidden' }: StaticRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const midLat = (pickup.lat + delivery.lat) / 2;
    const midLng = (pickup.lng + delivery.lng) / 2;

    import('maplibre-gl').then(async (ml) => {
      await import('maplibre-gl/dist/maplibre-gl.css' as any);

      const map = new ml.Map({
        container: containerRef.current!,
        style: process.env.NEXT_PUBLIC_MAPTILER_KEY && process.env.NEXT_PUBLIC_MAPTILER_KEY !== 'your-maptiler-key'
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
          : 'https://tiles.openfreemap.org/styles/liberty',
        center: [midLng, midLat],
        zoom: 5,
        interactive: false,
      });
      mapRef.current = map;

      map.on('load', () => {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[pickup.lng, pickup.lat], [delivery.lng, delivery.lat]],
            },
          },
        });
        map.addLayer({
          id: 'route', type: 'line', source: 'route',
          paint: { 'line-color': '#2A8C8A', 'line-width': 2 },
        });

        const startEl = document.createElement('div');
        startEl.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#2A8C8A;border:2px solid #fff;';
        new ml.Marker({ element: startEl }).setLngLat([pickup.lng, pickup.lat]).addTo(map);

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
