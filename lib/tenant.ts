/**
 * Tenant config read from the `sm_tenant` cookie.
 *
 * - Server components / Route Handlers: call `getTenantConfig()` (async, uses next/headers)
 * - Client components: call `getTenantConfigClient()` (sync, reads document.cookie)
 *
 * The cookie is written by middleware.ts on every request for custom/subdomain hosts.
 * On the main Shipmater domain it is always absent.
 */

export interface TenantConfig {
  id:               number;
  brand_name:       string | null;
  dba_name:         string | null;
  primary_color:    string | null;
  secondary_color:  string | null;
  logo_url_dark:    string | null;
  favicon_url:      string | null;
  hide_powered_by:  boolean;
}

export const SM_TENANT_COOKIE = 'sm_tenant';

// ── Server-side ───────────────────────────────────────────────────────────────

/** Read tenant config in a Server Component or Route Handler. */
export async function getTenantConfig(): Promise<TenantConfig | null> {
  try {
    const { cookies } = await import('next/headers');
    const store = await cookies();
    const raw = store.get(SM_TENANT_COOKIE)?.value;
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(raw)) as TenantConfig;
  } catch {
    return null;
  }
}

// ── Client-side ───────────────────────────────────────────────────────────────

/** Read tenant config in a Client Component (reads document.cookie). */
export function getTenantConfigClient(): TenantConfig | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${SM_TENANT_COOKIE}=([^;]*)`)
  );
  if (!match?.[1]) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as TenantConfig;
  } catch {
    return null;
  }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Apply tenant CSS variables to the document root (client only). */
export function applyTenantBranding(t: TenantConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (t.primary_color)   root.style.setProperty('--primary', t.primary_color);
  if (t.secondary_color) root.style.setProperty('--navy',    t.secondary_color);
  if (t.favicon_url) {
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (link) link.href = t.favicon_url;
  }
}

/** Reset any tenant CSS overrides back to stylesheet defaults. */
export function resetTenantBranding(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.removeProperty('--primary');
  root.style.removeProperty('--navy');
}
