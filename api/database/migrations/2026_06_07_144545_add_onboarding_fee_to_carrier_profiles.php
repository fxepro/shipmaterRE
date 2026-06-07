<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->boolean('onboarding_fee_paid')->default(false)->after('stripe_account_status');
            $table->string('onboarding_fee_payment_intent_id')->nullable()->after('onboarding_fee_paid');
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->dropColumn(['onboarding_fee_paid', 'onboarding_fee_payment_intent_id']);
        });
    }
};
