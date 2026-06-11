/**
 * Runtime API proxy — catches every /api/* request from the browser and
 * forwards it to the Laravel backend on Railway.
 *
 * Why a route handler instead of next.config rewrites:
 *   rewrites() in next.config.ts are evaluated at BUILD time, so
 *   API_PROXY_URL must be present during `npm run build`.  That makes
 *   Netlify env-var changes require a full rebuild to take effect.
 *   A route handler reads process.env at REQUEST time — no rebuild needed.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // need Node.js fetch + Buffer, not Edge

const BACKEND = (
  process.env.API_PROXY_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://127.0.0.1:8000'
).replace(/\/$/, '');

// Hop-by-hop headers we must not forward
const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'transfer-encoding',
  'te', 'upgrade', 'proxy-authorization', 'proxy-authenticate',
  'trailer',
]);

async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;
  const url = `${BACKEND}/api/${path.join('/')}${req.nextUrl.search}`;

  // Forward all request headers except hop-by-hop and host
  const reqHeaders: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    if (k !== 'host' && !HOP_BY_HOP.has(k)) reqHeaders[k] = v;
  });

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const body    = hasBody ? await req.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method:  req.method,
      headers: reqHeaders,
      body:    body ? Buffer.from(body) : undefined,
    });
  } catch (err) {
    console.error('[api-proxy] fetch error →', url, err);
    return NextResponse.json(
      { message: 'API proxy: backend unreachable', url },
      { status: 502 },
    );
  }

  // Forward response headers except hop-by-hop
  const resHeaders = new Headers();
  upstream.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k)) resHeaders.set(k, v);
  });

  return new NextResponse(upstream.body, {
    status:  upstream.status,
    headers: resHeaders,
  });
}

export const GET     = proxy;
export const POST    = proxy;
export const PUT     = proxy;
export const PATCH   = proxy;
export const DELETE  = proxy;
export const OPTIONS = proxy;
