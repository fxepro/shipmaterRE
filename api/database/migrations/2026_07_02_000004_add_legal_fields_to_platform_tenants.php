<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_tenants', function (Blueprint $table) {
            // ── Legal identity ─────────────────────────────────────────────────
            $table->string('legal_name')->nullable()->after('brand_name');
            $table->text('address')->nullable()->after('legal_name');
            $table->string('support_email')->nullable()->after('billing_email');
            $table->string('dot_number', 20)->nullable()->after('fmcsa_broker_mc');
            $table->string('broker_bond', 60)->nullable()->after('dot_number');

            // ── Compliance links ───────────────────────────────────────────────
            $table->string('terms_url')->nullable()->after('broker_bond');
            $table->string('privacy_url')->nullable()->after('terms_url');

            // ── Document generation ────────────────────────────────────────────
            $table->text('document_footer')->nullable()->after('privacy_url');
            $table->string('signature_authority')->nullable()->after('document_footer');
        });
    }

    public function down(): void
    {
        Schema::table('platform_tenants', function (Blueprint $table) {
            $table->dropColumn([
                'legal_name', 'address', 'support_email',
                'dot_number', 'broker_bond',
                'terms_url', 'privacy_url',
                'document_footer', 'signature_authority',
            ]);
        });
    }
};
