<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Plan B white-label tenant layer.
     *
     * Each PlatformTenant wraps an Organization (the tenant's own account) and
     * stores all white-label config: domain, branding, billing, feature flags.
     * Regular orgs have no row here — they use Shipmater's branding unchanged.
     */
    public function up(): void
    {
        Schema::create('platform_tenants', function (Blueprint $table) {
            $table->id();

            // The org that is the tenant (owner of this white-label deployment).
            $table->foreignId('org_id')
                  ->unique()
                  ->constrained('organizations')
                  ->cascadeOnDelete();

            // The platform lead that converted into this tenant, for CRM tracking.
            $table->foreignId('lead_id')
                  ->nullable()
                  ->constrained('platform_leads')
                  ->nullOnDelete();

            // ── Routing ───────────────────────────────────────────────────────
            // Subdomain: {subdomain}.shipmater.com  (wildcard DNS catch-all)
            $table->string('subdomain', 63)->unique()->nullable();
            // Custom domain: fully qualified, e.g. freight.acmecorp.com
            $table->string('custom_domain', 255)->unique()->nullable();

            // ── Branding ──────────────────────────────────────────────────────
            $table->string('brand_name')->nullable();          // overrides org name in UI
            $table->char('primary_color', 7)->nullable();      // e.g. #0096C7
            $table->char('secondary_color', 7)->nullable();    // e.g. #0A2E40
            $table->string('logo_url_dark')->nullable();       // logo for dark/navy backgrounds
            $table->string('favicon_url')->nullable();
            $table->boolean('hide_powered_by')->default(false);

            // ── Billing ───────────────────────────────────────────────────────
            // Stripe subscription for the monthly platform licence fee.
            $table->string('stripe_subscription_id')->nullable();
            // Billing email if different from org contact email.
            $table->string('billing_email')->nullable();

            // ── Compliance ────────────────────────────────────────────────────
            // If set, tenant operates under their own FMCSA broker authority.
            // If null, they operate under Shipmater's authority (agency agreement required).
            $table->string('fmcsa_broker_mc', 20)->nullable();

            // ── Features / limits ─────────────────────────────────────────────
            // JSON: { "sso": true, "api_access": true, "dedicated_db": false, ... }
            $table->json('feature_flags')->nullable();

            // ── Admin ─────────────────────────────────────────────────────────
            $table->enum('status', ['pending', 'active', 'suspended'])->default('pending');
            $table->text('notes')->nullable();  // internal Shipmater staff notes

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_tenants');
    }
};
