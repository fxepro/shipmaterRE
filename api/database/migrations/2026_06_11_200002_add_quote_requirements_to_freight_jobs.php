<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('freight_jobs', function (Blueprint $table) {
            // Stores which rate fields the shipper wants carriers to quote on.
            // e.g. { "rate_type": "per_mile", "require_fuel_surcharge": true, ... }
            $table->jsonb('quote_requirements')->nullable()->after('cost_breakdown');
        });
    }

    public function down(): void
    {
        Schema::table('freight_jobs', function (Blueprint $table) {
            $table->dropColumn('quote_requirements');
        });
    }
};
