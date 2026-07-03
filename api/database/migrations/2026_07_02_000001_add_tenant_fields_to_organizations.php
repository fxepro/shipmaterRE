<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            // ── Stripe billing mode ───────────────────────────────────────────
            // 'platform' (default): all payments flow through Shipmater's Stripe → maximises GMV/ARR.
            // 'connect': enterprise orgs with their own Stripe Connect account;
            //            Shipmater collects commission via application_fee_amount.
            // Admin-only toggle — never exposed to org users.
            $table->enum('stripe_mode', ['platform', 'connect'])->default('platform')->after('settings');
            $table->string('stripe_connect_id')->nullable()->after('stripe_mode');

            // Per-org commission override (decimal, e.g. 0.0300 = 3%).
            // Null = use platform default (PLATFORM_FEE_PERCENT env).
            $table->decimal('commission_rate', 5, 4)->nullable()->after('stripe_connect_id');

            // FMCSA freight broker authority for white-label tenants operating
            // under their own broker MC number rather than Shipmater's umbrella.
            $table->string('fmcsa_broker_mc', 20)->nullable()->after('commission_rate');

            // Marks this org as a white-label platform tenant.
            // Regular carrier/shipper orgs stay false — zero behaviour change for them.
            $table->boolean('is_platform_tenant')->default(false)->after('fmcsa_broker_mc');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_mode',
                'stripe_connect_id',
                'commission_rate',
                'fmcsa_broker_mc',
                'is_platform_tenant',
            ]);
        });
    }
};
