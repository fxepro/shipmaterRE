// eslint-disable-next-line @typescript-eslint/no-explicit-any
let echoInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEcho(): any {
  if (echoInstance) return echoInstance;

  if (typeof window === 'undefined') {
    throw new Error('Laravel Echo can only be initialised on the client');
  }

  // Dynamically import to avoid SSR issues
  const Pusher = require('pusher-js');
  window.Pusher = Pusher;

  const LaravelEcho = require('laravel-echo');
  echoInstance = new LaravelEcho.default({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: process.env.NODE_ENV === 'production',
    enabledTransports: ['ws', 'wss'],
  });

  return echoInstance!;
}

export function disconnectEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
}
