import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getStoredToken } from './api';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

let echo: Echo | null = null;

export function getEcho(): Echo {
  if (echo) return echo;
  if (typeof window === 'undefined') throw new Error('Echo is client-only');

  window.Pusher = Pusher;

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
  id:          number;
  shipment_id: number;
  lat:         number;
  lng:         number;
  speed:       number | null;
  eta:         string | null;
  pinged_at:   string;
};
