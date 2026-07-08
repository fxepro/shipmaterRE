<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── job_stops ──────────────────────────────────────────────────────────
        Schema::table('job_stops', function (Blueprint $table) {
            // Add country (wasn't there at all)
            $table->string('country', 3)->default('US')->after('zip');
            // Widen state so international regions fit (NSW, ON, etc.)
            $table->string('state', 10)->change();
            // Alias postal_code alongside existing zip
            $table->string('postal_code', 20)->nullable()->after('country');
        });

        // ── carrier_profiles ──────────────────────────────────────────────────
        Schema::table('carrier_profiles', function (Blueprint $table) {
            // Address country
            $table->string('country', 3)->default('US')->after('zip');
            // Widen state from varchar(2) → varchar(10)
            $table->string('state', 10)->nullable()->change();
            // Where this carrier operates (drives Checkr country, FMCSA skip, etc.)
            $table->string('operating_country', 3)->default('US')->after('country');
            // Phone in E.164 international format (e.g. +14155552671)
            $table->string('phone_e164', 25)->nullable()->after('phone');

            // International ID fields (used when operating_country != 'US')
            // Separate from US-specific ssn_last_4 / dl_number / dl_state
            $table->string('national_id_type', 50)->nullable()->after('id_type');
            // e.g. "passport", "national_identity_card", "provincial_id", "residence_permit"
            $table->string('national_id_number', 100)->nullable()->after('national_id_type');
            $table->string('dl_country', 3)->nullable()->after('dl_state');
            // For non-US operating authority (NSC, Community Licence number, etc.)
            $table->string('operating_authority_number', 60)->nullable()->after('mc_number');
            $table->string('operating_authority_type', 30)->nullable()->after('operating_authority_number');
            // e.g. "MC", "NSC", "community_licence", "tir", "other"
        });

        // ── organizations ─────────────────────────────────────────────────────
        Schema::table('organizations', function (Blueprint $table) {
            // Widen state from varchar(2) → varchar(10)
            $table->string('state', 10)->nullable()->change();
            // Tax ID — generic (EIN for US, BN for Canada, VAT for EU, etc.)
            $table->string('tax_id', 50)->nullable()->after('zip');
            $table->string('tax_id_type', 20)->nullable()->after('tax_id');
            // e.g. "EIN", "BN", "VAT", "ABN", "other"
        });

        // ── locations (address book) ───────────────────────────────────────────
        // Already has country. Just widen state and add postal_code alias.
        Schema::table('locations', function (Blueprint $table) {
            $table->string('state', 10)->nullable()->change();
            $table->string('postal_code', 20)->nullable()->after('zip');
        });
    }

    public function down(): void
    {
        Schema::table('job_stops', function (Blueprint $table) {
            $table->dropColumn(['country', 'postal_code']);
            $table->string('state', 5)->change();
        });
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'country', 'operating_country', 'phone_e164',
                'national_id_type', 'national_id_number',
                'dl_country', 'operating_authority_number', 'operating_authority_type',
            ]);
        });
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn(['tax_id', 'tax_id_type']);
        });
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn(['postal_code']);
        });
    }
};
