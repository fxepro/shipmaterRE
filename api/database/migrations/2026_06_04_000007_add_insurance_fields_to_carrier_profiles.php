<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('carrier_profiles', 'auto_policy_number'))
                $table->string('auto_policy_number')->nullable();
            if (!Schema::hasColumn('carrier_profiles', 'auto_insurer_name'))
                $table->string('auto_insurer_name')->nullable();
            if (!Schema::hasColumn('carrier_profiles', 'auto_coverage_amount'))
                $table->decimal('auto_coverage_amount', 12, 2)->nullable();
            if (!Schema::hasColumn('carrier_profiles', 'auto_effective_date'))
                $table->date('auto_effective_date')->nullable();
            if (!Schema::hasColumn('carrier_profiles', 'auto_expiry_date'))
                $table->date('auto_expiry_date')->nullable();
            if (!Schema::hasColumn('carrier_profiles', 'cargo_policy_number'))
                $table->string('cargo_policy_number')->nullable();
            if (!Schema::hasColumn('carrier_profiles', 'cargo_insurer_name'))
                $table->string('cargo_insurer_name')->nullable();
            if (!Schema::hasColumn('carrier_profiles', 'cargo_coverage_amount'))
                $table->decimal('cargo_coverage_amount', 12, 2)->nullable();
            if (!Schema::hasColumn('carrier_profiles', 'cargo_expiry_date'))
                $table->date('cargo_expiry_date')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $cols = ['auto_policy_number','auto_insurer_name','auto_coverage_amount','auto_effective_date','auto_expiry_date',
                     'cargo_policy_number','cargo_insurer_name','cargo_coverage_amount','cargo_expiry_date'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('carrier_profiles', $col))
                    $table->dropColumn($col);
            }
        });
    }
};
