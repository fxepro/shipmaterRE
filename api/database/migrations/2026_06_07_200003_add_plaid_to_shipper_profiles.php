<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipper_profiles', function (Blueprint $table) {
            $table->string('plaid_access_token')->nullable()->after('notif_sms');
            $table->string('plaid_item_id')->nullable()->after('plaid_access_token');
            $table->string('plaid_account_id')->nullable()->after('plaid_item_id');
            $table->string('bank_last4')->nullable()->after('plaid_account_id');
            $table->string('bank_name')->nullable()->after('bank_last4');
            $table->string('bank_institution_name')->nullable()->after('bank_name');
            $table->timestamp('plaid_connected_at')->nullable()->after('bank_institution_name');
            // Stripe bank account token created from Plaid processor token
            $table->string('stripe_bank_source_id')->nullable()->after('plaid_connected_at');
        });
    }

    public function down(): void
    {
        Schema::table('shipper_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'plaid_access_token', 'plaid_item_id', 'plaid_account_id',
                'bank_last4', 'bank_name', 'bank_institution_name',
                'plaid_connected_at', 'stripe_bank_source_id',
            ]);
        });
    }
};
