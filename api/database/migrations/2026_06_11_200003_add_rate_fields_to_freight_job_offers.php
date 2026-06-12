<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('freight_job_offers', function (Blueprint $table) {
            // Rate structure (mirrors contract fields)
            $table->string('rate_type', 20)->default('flat')->after('carrier_id');
            // Per-unit rate ($/mile or $/hr). Null for flat-rate offers.
            $table->decimal('rate_value', 10, 2)->nullable()->after('rate_type');
            // Add-on fields — null means not requested / not provided
            $table->decimal('fuel_surcharge', 8, 2)->nullable()->after('amount');
            $table->decimal('detention_rate', 8, 2)->nullable()->after('fuel_surcharge');
            $table->unsignedTinyInteger('free_time_hrs')->nullable()->after('detention_rate');
            $table->string('equipment_type', 30)->nullable()->after('free_time_hrs');
            $table->unsignedInteger('max_weight_lbs')->nullable()->after('equipment_type');
            $table->string('payment_terms', 20)->nullable()->after('max_weight_lbs');
        });
    }

    public function down(): void
    {
        Schema::table('freight_job_offers', function (Blueprint $table) {
            $table->dropColumn([
                'rate_type', 'rate_value',
                'fuel_surcharge', 'detention_rate', 'free_time_hrs',
                'equipment_type', 'max_weight_lbs', 'payment_terms',
            ]);
        });
    }
};
