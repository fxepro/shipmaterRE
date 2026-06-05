<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            // Only add columns that don't exist yet
            if (!Schema::hasColumn('carrier_profiles', 'carrier_type')) {
                $table->string('carrier_type')->default('sole_proprietor')->after('user_id');
            }
            if (!Schema::hasColumn('carrier_profiles', 'carrier_type_selected_at')) {
                $table->timestamp('carrier_type_selected_at')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'ssn_last_4')) {
                $table->string('ssn_last_4', 4)->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'photo_url')) {
                $table->string('photo_url')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'cdl_number')) {
                $table->string('cdl_number', 20)->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'cdl_expiry_date')) {
                $table->date('cdl_expiry_date')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'cdl_class')) {
                $table->string('cdl_class', 5)->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'usdot_number')) {
                $table->string('usdot_number', 20)->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'hazmat_endorsement')) {
                $table->boolean('hazmat_endorsement')->default(false);
            }
            if (!Schema::hasColumn('carrier_profiles', 'hazmat_expiry_date')) {
                $table->date('hazmat_expiry_date')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'dot_medical_expiry')) {
                $table->date('dot_medical_expiry')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'drug_test_date')) {
                $table->date('drug_test_date')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'drug_test_result')) {
                $table->string('drug_test_result', 20)->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'verification_status')) {
                $table->string('verification_status', 30)->default('incomplete');
            }
            if (!Schema::hasColumn('carrier_profiles', 'verification_status_updated_at')) {
                $table->timestamp('verification_status_updated_at')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'verification_notes')) {
                $table->text('verification_notes')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'stripe_account_id')) {
                $table->string('stripe_account_id')->nullable()->unique();
            }
            if (!Schema::hasColumn('carrier_profiles', 'stripe_account_status')) {
                $table->string('stripe_account_status', 30)->default('not_connected');
            }
            if (!Schema::hasColumn('carrier_profiles', 'stripe_verification_data')) {
                $table->json('stripe_verification_data')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'submitted_for_verification_at')) {
                $table->timestamp('submitted_for_verification_at')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'last_verification_at')) {
                $table->timestamp('last_verification_at')->nullable();
            }
            if (!Schema::hasColumn('carrier_profiles', 'next_reverification_at')) {
                $table->timestamp('next_reverification_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $columns = [
                'carrier_type', 'carrier_type_selected_at',
                'date_of_birth', 'ssn_last_4', 'photo_url',
                'cdl_number', 'cdl_expiry_date', 'cdl_class',
                'usdot_number', 'hazmat_endorsement', 'hazmat_expiry_date',
                'dot_medical_expiry', 'drug_test_date', 'drug_test_result',
                'verification_status', 'verification_status_updated_at', 'verification_notes',
                'stripe_account_id', 'stripe_account_status', 'stripe_verification_data',
                'submitted_for_verification_at', 'last_verification_at', 'next_reverification_at',
            ];
            foreach ($columns as $col) {
                if (Schema::hasColumn('carrier_profiles', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
