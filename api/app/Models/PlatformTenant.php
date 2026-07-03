<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlatformTenant extends Model
{
    protected $fillable = [
        'org_id',
        'lead_id',
        // Routing
        'subdomain',
        'custom_domain',
        // Branding
        'brand_name',
        'dba_name',          // "Trading as / DBA" — for doc headers only; legal name lives in org profile
        'primary_color',
        'secondary_color',
        'logo_url_dark',
        'favicon_url',
        'hide_powered_by',
        // Email sending
        'mail_from_name',
        'mail_from_address',
        'mail_driver',
        'mail_host',
        'mail_port',
        'mail_username',
        'mail_password',
        'mail_encryption',
        'mail_api_key',
        'mail_domain',
        'mail_region',
        // Billing
        'stripe_subscription_id',
        'billing_email',
        // Config
        'feature_flags',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'feature_flags'    => 'json',
            'hide_powered_by'  => 'boolean',
            'mail_password'    => 'encrypted',
            'mail_api_key'     => 'encrypted',
            'mail_port'        => 'integer',
        ];
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function org(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(PlatformLead::class, 'lead_id');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isActive():    bool { return $this->status === 'active'; }
    public function isPending():   bool { return $this->status === 'pending'; }
    public function isSuspended(): bool { return $this->status === 'suspended'; }

    public function hasFeature(string $key): bool
    {
        return (bool) ($this->feature_flags[$key] ?? false);
    }

    /** The URL users access this tenant's app on. */
    public function appUrl(): string
    {
        if ($this->custom_domain) {
            return "https://{$this->custom_domain}";
        }

        if ($this->subdomain) {
            $base = config('app.url', 'https://app.shipmater.com');
            $host = parse_url($base, PHP_URL_HOST);
            return "https://{$this->subdomain}.{$host}";
        }

        return config('app.url', 'https://app.shipmater.com');
    }
}
