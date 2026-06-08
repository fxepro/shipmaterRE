'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { shipmentApi } from '@/lib/api';

type TrackerState = 'idle' | 'acquiring' | 'active' | 'error';

interface UseGpsTrackerOptions {
  shipmentId: number;
  enabled: boolean;        // only track when true (i.e. job is in_transit)
  intervalMs?: number;     // min ms between pings (default 20 000 = 20 s)
}

interface UseGpsTrackerReturn {
  state: TrackerState;
  lastPingedAt: Date | null;
  error: string | null;
  start: () => void;
  stop: () => void;
}

export function useGpsTracker({
  shipmentId,
  enabled,
  intervalMs = 20_000,
}: UseGpsTrackerOptions): UseGpsTrackerReturn {
  const [state, setState]               = useState<TrackerState>('idle');
  const [lastPingedAt, setLastPingedAt] = useState<Date | null>(null);
  const [error, setError]               = useState<string | null>(null);

  const watchIdRef      = useRef<number | null>(null);
  const lastPingTimeRef = useRef<number>(0);
  const lastLatRef      = useRef<number | null>(null);
  const lastLngRef      = useRef<number | null>(null);
  const enabledRef      = useRef(enabled);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const sendPing = useCallback(async (lat: number, lng: number, speed: number | null) => {
    const now = Date.now();
    if (now - lastPingTimeRef.current < intervalMs) return;

    // Skip if barely moved (< ~50 metres = 0.0005 degrees)
    const lastLat = lastLatRef.current;
    const lastLng = lastLngRef.current;
    const MIN_DELTA = 0.0005;
    if (
      lastLat !== null && lastLng !== null &&
      Math.abs(lat - lastLat) < MIN_DELTA &&
      Math.abs(lng - lastLng) < MIN_DELTA
    ) return;

    lastPingTimeRef.current = now;
    lastLatRef.current = lat;
    lastLngRef.current = lng;

    try {
      await shipmentApi.ping(shipmentId, { lat, lng, speed });
      setLastPingedAt(new Date());
    } catch {
      // Non-fatal — just miss this ping, will retry next position update
    }
  }, [shipmentId, intervalMs]);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this device.');
      setState('error');
      return;
    }
    if (watchIdRef.current !== null) return; // already watching

    setState('acquiring');
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState('active');
        sendPing(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.speed ?? null,
        );
      },
      (err) => {
        const msg = err.code === err.PERMISSION_DENIED
          ? 'Location permission denied. Enable it in your browser settings.'
          : err.code === err.POSITION_UNAVAILABLE
            ? 'Location unavailable. Check your GPS signal.'
            : 'Location timed out. Retrying…';
        setError(msg);
        setState('error');
      },
      {
        enableHighAccuracy: true,
        maximumAge:         10_000,   // 10 s cached position is OK
        timeout:            15_000,
      }
    );
  }, [sendPing]);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState('idle');
    setError(null);
  }, []);

  // Auto-stop when disabled (job no longer in_transit)
  useEffect(() => {
    if (!enabled) stop();
  }, [enabled, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { state, lastPingedAt, error, start, stop };
}
