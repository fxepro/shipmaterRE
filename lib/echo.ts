/* eslint-disable @typescript-eslint/no-explicit-any */
import Pusher from 'pusher-js';
import { getStoredToken } from './api';

declare global {
  interface Window {
    // NOTE: Window.Pusher is already declared as `unknown` by pusher-js — we
    // only declare Echo here to avoid a duplicate-declaration TS error.
    Echo: any;
  }
}

let echo: any = null;

export async function getEcho(): Promise<any> {
  if (echo) return echo;
  if (typeof window === 'undefined') throw new Error('Echo is client-only');

  const { default: Echo } = await import('laravel-echo');
  // Use a cast so we bypass the pusher-js Window.Pusher: unknown constraint
  (window as any).Pusher = Pusher;

  echo = new Echo({
    broadcaster:       'reverb',
    key:               process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
    wsHost:            process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
    wsPort:            Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort:           Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS:          false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint:      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${getStoredToken()}`,
        Accept:        'application/json',
      },
    },
  });

  return echo;
}

export function disconnectEcho(): void {
  echo?.disconnect();
  echo = null;
}

export type PingPayload = {
  id:            number;
  shipment_id:   number;
  lat:           number;
  lng:           number;
  speed:         number | null;
  eta:           string | null;
  state_crossed: string | null;
  timestamp:     string;
};
