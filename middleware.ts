import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'sm_tenant';
const COOKIE_TTL  = 300; // 5 min — stale is fine, cosmetic only

// Hosts that are always the "main" Shipmater app — no tenant resolution needed
function isMainHost(hostname: string): boolean {
  const appHost = process.env.NEXT_PUBLIC_APP_HOST ?? 'app.shipmater.com';
  return (
    hostname === appHost ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname)
  );
}

export async function middleware(req: NextRequest) {
  const host     = req.headers.get('host') ?? '';
  const hostname = host.split(':')[0].toLowerCase();
  const res      = NextResponse.next();

  if (isMainHost(hostname)) {
    // On the main domain — clear any stale tenant cookie so defaults apply
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  // Custom domain or *.shipmater.com subdomain — try to resolve a tenant
  try {
    // Use internal API URL (server→server); falls back to the public one for local/dev
    const apiBase = (
      process.env.API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      'http://127.0.0.1:8888'
    ).replace(/\/$/, '');

    const url = `${apiBase}/api/v1/tenant/resolve?domain=${encodeURIComponent(hostname)}`;

    const r = await fetch(url, {
      headers: { Accept: 'application/json' },
      // No cache — we rely on the cookie TTL for rate-limiting resolve calls
      cache: 'no-store',
    });

    if (r.ok) {
      const json = await r.json();
      const tenant = json?.data ?? null;

      if (tenant) {
        res.cookies.set(COOKIE_NAME, JSON.stringify(tenant), {
          path:     '/',
          maxAge:   COOKIE_TTL,
          sameSite: 'lax',
          httpOnly: false,   // client JS reads it to apply CSS vars
          secure:   req.nextUrl.protocol === 'https:',
        });
      } else {
        res.cookies.delete(COOKIE_NAME);
      }
    }
  } catch {
    // Network error — leave whatever cookie exists, don't break the request
  }

  return res;
}

export const config = {
  matcher: [
    // All paths except Next.js internals and static assets
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|css|js|woff2?)).*)',
  ],
};
