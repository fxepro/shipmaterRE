<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformTenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    // ── Public ────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/tenant/resolve?domain={host}
     * Resolves a hostname to a tenant's public brand config.
     * Used by Next.js middleware on every request — no auth required.
     */
    public function resolve(Request $request): JsonResponse
    {
        $domain = trim($request->query('domain', ''));

        if (! $domain) {
            return response()->json(['data' => null]);
        }

        $host = strtolower(explode(':', $domain)[0]);

        $tenant = PlatformTenant::where('custom_domain', $host)
            ->orWhere('subdomain', $this->extractSubdomain($host))
            ->where('status', 'active')
            ->first();

        return response()->json(['data' => $tenant ? $this->publicFormat($tenant) : null]);
    }

    // ── Authenticated ─────────────────────────────────────────────────────────

    // GET /api/v1/tenant/branding
    public function show(Request $request): JsonResponse
    {
        $tenant = $this->tenantForUser($request);
        return response()->json(['data' => $tenant ? $this->format($tenant) : null]);
    }

    // PUT /api/v1/tenant/branding
    public function update(Request $request): JsonResponse
    {
        $tenant = $this->tenantForUser($request);

        if (! $tenant) {
            return response()->json(['message' => 'No white-label tenant found for this organisation.'], 404);
        }

        $data = $request->validate([
            // Branding
            'brand_name'      => ['sometimes', 'string', 'max:80'],
            'dba_name'        => ['sometimes', 'nullable', 'string', 'max:120'],
            'primary_color'   => ['sometimes', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_color' => ['sometimes', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'logo_url_dark'   => ['sometimes', 'nullable', 'url', 'max:500'],
            'favicon_url'     => ['sometimes', 'nullable', 'url', 'max:500'],
            'hide_powered_by' => ['sometimes', 'boolean'],
            // Domain
            'subdomain'       => ['sometimes', 'nullable', 'string', 'alpha_dash', 'max:63'],
            'custom_domain'   => ['sometimes', 'nullable', 'string', 'max:255'],
            // Settings
            'billing_email'   => ['sometimes', 'nullable', 'email'],
            'feature_flags'   => ['sometimes', 'array'],
            // Email
            'mail_from_name'  => ['sometimes', 'nullable', 'string', 'max:80'],
            'mail_from_address' => ['sometimes', 'nullable', 'email'],
            'mail_driver'     => ['sometimes', 'string', 'in:default,smtp,postmark,sendgrid,mailgun,ses'],
            'mail_host'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'mail_port'       => ['sometimes', 'nullable', 'integer', 'min:1', 'max:65535'],
            'mail_username'   => ['sometimes', 'nullable', 'string', 'max:255'],
            'mail_password'   => ['sometimes', 'nullable', 'string', 'max:500'],
            'mail_encryption' => ['sometimes', 'nullable', 'in:tls,ssl,'],
            'mail_api_key'    => ['sometimes', 'nullable', 'string', 'max:500'],
            'mail_domain'     => ['sometimes', 'nullable', 'string', 'max:255'],
            'mail_region'     => ['sometimes', 'nullable', 'string', 'max:20'],
        ]);

        $tenant->update($data);

        return response()->json(['data' => $this->format($tenant->fresh())]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function tenantForUser(Request $request): ?PlatformTenant
    {
        $orgId = $request->user()?->current_org_id;
        if (! $orgId) return null;
        return PlatformTenant::where('org_id', $orgId)->first();
    }

    private function extractSubdomain(string $host): string
    {
        $parts = explode('.', $host);
        return count($parts) >= 3 ? $parts[0] : '';
    }

    /** Minimal public config — safe to expose without auth */
    private function publicFormat(PlatformTenant $t): array
    {
        return [
            'id'              => $t->id,
            'brand_name'      => $t->brand_name,
            'dba_name'        => $t->dba_name,
            'primary_color'   => $t->primary_color,
            'secondary_color' => $t->secondary_color,
            'logo_url_dark'   => $t->logo_url_dark,
            'favicon_url'     => $t->favicon_url,
            'hide_powered_by' => (bool) $t->hide_powered_by,
        ];
    }

    /** Full config for the authenticated tenant owner */
    private function format(PlatformTenant $t): array
    {
        return array_merge($this->publicFormat($t), [
            'org_id'          => $t->org_id,
            'subdomain'       => $t->subdomain,
            'custom_domain'   => $t->custom_domain,
            'billing_email'   => $t->billing_email,
            'feature_flags'   => $t->feature_flags ?? [],
            'status'          => $t->status,
            'app_url'         => $t->appUrl(),
            'mail_from_name'  => $t->mail_from_name,
            'mail_from_address' => $t->mail_from_address,
            'mail_driver'     => $t->mail_driver ?? 'default',
            'mail_host'       => $t->mail_host,
            'mail_port'       => $t->mail_port,
            'mail_username'   => $t->mail_username,
            'mail_password'   => $t->mail_password ? '••••••••' : null,
            'mail_encryption' => $t->mail_encryption,
            'mail_api_key'    => $t->mail_api_key  ? '••••••••' : null,
            'mail_domain'     => $t->mail_domain,
            'mail_region'     => $t->mail_region,
        ]);
    }
}
