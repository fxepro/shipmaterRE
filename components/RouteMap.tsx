'use client';

import { useRef, useEffect, useCallback } from 'react';

export interface RouteMapStop {
  lat: number;
  lng: number;
  stopType: 'pickup' | 'dropoff';
  label: string; // A, B, C…
}

interface Props {
  stops:    RouteMapStop[];
  geometry?: [number, number][]; // [lng, lat][] route line
  className?: string;
}

export function RouteMap({ stops, geometry, className = 'h-full w-full' }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<any>(null);
  const markersRef    = useRef<any[]>([]);
  const mapReadyRef   = useRef(false);

  const latestStopsRef    = useRef(stops);
  const latestGeometryRef = useRef(geometry);
  latestStopsRef.current    = stops;
  latestGeometryRef.current = geometry;

  const applyUpdate = useCallback((ml: any) => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const pts = latestStopsRef.current;

    pts.forEach((stop) => {
      const isPickup = stop.stopType === 'pickup';
      const el = document.createElement('div');
      el.style.cssText = `
        width:30px;height:30px;border-radius:50%;
        background:${isPickup ? '#0F1923' : '#2A8C8A'};
        border:3px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-size:12px;font-weight:700;
        cursor:default;
      `;
      el.textContent = stop.label;
      markersRef.current.push(
        new ml.Marker({ element: el }).setLngLat([stop.lng, stop.lat]).addTo(map)
      );
    });

    const src = map.getSource('route') as any;
    if (src) {
      src.setData({
        type: 'Feature', properties: {},
        geometry: {
          type: 'LineString',
          coordinates: latestGeometryRef.current ?? [],
        },
      });
    }

    if (pts.length >= 2) {
      const lngs = pts.map(s => s.lng);
      const lats  = pts.map(s => s.lat);
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 70, maxZoom: 11, duration: 700 },
      );
    } else if (pts.length === 1) {
      map.flyTo({ center: [pts[0].lng, pts[0].lat], zoom: 10 });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('maplibre-gl').then(async (ml) => {
      await import('maplibre-gl/dist/maplibre-gl.css' as any);

      const map = new ml.Map({
        container: containerRef.current!,
        style: process.env.NEXT_PUBLIC_MAPTILER_KEY && process.env.NEXT_PUBLIC_MAPTILER_KEY !== 'your-maptiler-key'
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
          : 'https://tiles.openfreemap.org/styles/liberty',
        center: [-98.5795, 39.8283],
        zoom: 3.5,
      });
      mapRef.current = map;

      map.on('load', () => {
        mapReadyRef.current = true;

        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
        });
        map.addLayer({
          id: 'route-casing', type: 'line', source: 'route',
          paint: { 'line-color': '#ffffff', 'line-width': 7, 'line-opacity': 0.5 },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
        });
        map.addLayer({
          id: 'route-line', type: 'line', source: 'route',
          paint: { 'line-color': '#2A8C8A', 'line-width': 4, 'line-opacity': 0.9 },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
        });

        applyUpdate(ml);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
    };
  }, [applyUpdate]);

  useEffect(() => {
    if (!mapReadyRef.current) return;
    import('maplibre-gl').then(ml => applyUpdate(ml));
  }, [stops, geometry, applyUpdate]);

  return <div ref={containerRef} className={className} />;
}
