<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            // Stripe Identity
            $table->boolean('identity_verified')->default(false)->after('dot_verified');
            $table->timestamp('identity_verified_at')->nullable()->after('identity_verified');

            // Checkr (background check) — IDs for webhook matching
            $table->string('checkr_candidate_id')->nullable()->after('background_check_status');
            $table->string('checkr_report_id')->nullable()->after('checkr_candidate_id');
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'identity_verified',
                'identity_verified_at',
                'checkr_candidate_id',
                'checkr_report_id',
            ]);
        });
    }
};
