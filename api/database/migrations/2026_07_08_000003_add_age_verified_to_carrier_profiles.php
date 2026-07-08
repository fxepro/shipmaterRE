<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            // Age gate — auto-set from DOB (18+ for standard, configurable per freight type)
            $table->boolean('age_verified')->default(false)->after('identity_verified_at');
            $table->timestamp('age_verified_at')->nullable()->after('age_verified');

            // Full DOB stored on the identity verification record so we can re-check
            // (date_of_birth already exists on this table — added in original migration)
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->dropColumn(['age_verified', 'age_verified_at']);
        });
    }
};
