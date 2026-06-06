<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // carrier_profiles
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->foreignId('org_id')->nullable()->after('user_id')
                  ->constrained('organizations')->nullOnDelete();
        });

        // shipper_profiles
        Schema::table('shipper_profiles', function (Blueprint $table) {
            $table->foreignId('org_id')->nullable()->after('user_id')
                  ->constrained('organizations')->nullOnDelete();
        });

        // shipments — add org + service type
        Schema::table('shipments', function (Blueprint $table) {
            $table->foreignId('org_id')->nullable()->after('id')
                  ->constrained('organizations')->nullOnDelete();
            $table->foreignId('service_type_id')->nullable()
                  ->constrained('service_types')->nullOnDelete();
            $table->json('required_cert_keys')->nullable();
        });

        // bids
        Schema::table('bids', function (Blueprint $table) {
            $table->foreignId('org_id')->nullable()->after('id')
                  ->constrained('organizations')->nullOnDelete();
        });

        // payment_methods — add org (keep user_id for backward compat)
        Schema::table('payment_methods', function (Blueprint $table) {
            $table->foreignId('org_id')->nullable()->after('user_id')
                  ->constrained('organizations')->nullOnDelete();
        });

        // preferred_carriers
        Schema::table('preferred_carriers', function (Blueprint $table) {
            $table->foreignId('shipper_org_id')->nullable()->after('id')
                  ->constrained('organizations')->nullOnDelete();
            $table->foreignId('carrier_org_id')->nullable()
                  ->constrained('organizations')->nullOnDelete();
        });

        // contracts
        Schema::table('contracts', function (Blueprint $table) {
            $table->foreignId('shipper_org_id')->nullable()->after('id')
                  ->constrained('organizations')->nullOnDelete();
            $table->foreignId('carrier_org_id')->nullable()
                  ->constrained('organizations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', fn($t) => $t->dropForeign(['org_id']));
        Schema::table('shipper_profiles',  fn($t) => $t->dropForeign(['org_id']));

        Schema::table('shipments', function ($t) {
            $t->dropForeign(['org_id']);
            $t->dropForeign(['service_type_id']);
            $t->dropColumn(['org_id', 'service_type_id', 'required_cert_keys']);
        });

        Schema::table('bids',             fn($t) => $t->dropForeign(['org_id']));
        Schema::table('payment_methods',  fn($t) => $t->dropForeign(['org_id']));

        Schema::table('preferred_carriers', function ($t) {
            $t->dropForeign(['shipper_org_id']);
            $t->dropForeign(['carrier_org_id']);
            $t->dropColumn(['shipper_org_id', 'carrier_org_id']);
        });

        Schema::table('contracts', function ($t) {
            $t->dropForeign(['shipper_org_id']);
            $t->dropForeign(['carrier_org_id']);
            $t->dropColumn(['shipper_org_id', 'carrier_org_id']);
        });

        foreach (['carrier_profiles', 'shipper_profiles', 'bids', 'payment_methods'] as $table) {
            Schema::table($table, fn($t) => $t->dropColumn('org_id'));
        }
    }
};
