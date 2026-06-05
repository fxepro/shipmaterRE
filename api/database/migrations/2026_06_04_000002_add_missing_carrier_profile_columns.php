<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('carrier_profiles', 'cdl_issuing_state')) {
                $table->string('cdl_issuing_state', 2)->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'tanker_endorsement')) {
                $table->boolean('tanker_endorsement')->default(false);
            }
            if (!Schema::hasColumn('carrier_profiles', 'passenger_endorsement')) {
                $table->boolean('passenger_endorsement')->default(false);
            }
            if (!Schema::hasColumn('carrier_profiles', 'medical_examiner_name')) {
                $table->string('medical_examiner_name')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            foreach (['cdl_issuing_state', 'tanker_endorsement', 'passenger_endorsement', 'medical_examiner_name'] as $col) {
                if (Schema::hasColumn('carrier_profiles', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
