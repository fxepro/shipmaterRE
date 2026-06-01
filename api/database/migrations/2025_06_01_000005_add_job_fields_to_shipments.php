<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Extend status CHECK to include bidding + offered (PostgreSQL)
        DB::statement("ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_status_check");
        DB::statement("ALTER TABLE shipments ADD CONSTRAINT shipments_status_check CHECK (status::text = ANY (ARRAY['pending'::text,'bidding'::text,'offered'::text,'assigned'::text,'in_transit'::text,'delivered'::text,'disputed'::text,'cancelled'::text]))");

        Schema::table('shipments', function (Blueprint $table) {
            $table->string('job_type', 20)->default('open')->after('status');
            $table->foreignId('contract_id')
                ->nullable()
                ->constrained('contracts')
                ->nullOnDelete()
                ->after('job_type');
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropForeign(['contract_id']);
            $table->dropColumn(['job_type', 'contract_id']);
        });

        DB::statement("ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_status_check");
        DB::statement("ALTER TABLE shipments ADD CONSTRAINT shipments_status_check CHECK (status::text = ANY (ARRAY['pending'::text,'assigned'::text,'in_transit'::text,'delivered'::text,'disputed'::text,'cancelled'::text]))");
    }
};