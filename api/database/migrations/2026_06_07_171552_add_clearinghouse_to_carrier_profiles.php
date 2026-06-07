<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            // Query tracking
            $table->string('clearinghouse_query_id')->nullable()->after('checkr_report_id');

            // Status:
            //   not_run          — never queried
            //   pending_consent  — query submitted, driver must consent on FMCSA portal
            //   querying         — consent given, FMCSA processing the report
            //   clear            — no violations found
            //   violations_found — violations exist, admin reviews
            //   error            — API/network error, safe to retry
            $table->string('clearinghouse_query_status')->default('not_run')->after('clearinghouse_query_id');

            $table->timestamp('clearinghouse_queried_at')->nullable()->after('clearinghouse_query_status');
            $table->timestamp('clearinghouse_completed_at')->nullable()->after('clearinghouse_queried_at');
            $table->json('clearinghouse_result_data')->nullable()->after('clearinghouse_completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'clearinghouse_query_id',
                'clearinghouse_query_status',
                'clearinghouse_queried_at',
                'clearinghouse_completed_at',
                'clearinghouse_result_data',
            ]);
        });
    }
};
