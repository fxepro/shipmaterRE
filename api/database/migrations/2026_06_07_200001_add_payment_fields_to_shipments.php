<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('payment_intent_id')->nullable()->after('agreed_cost');
            $table->string('payment_status')->default('unpaid')->after('payment_intent_id');
            // unpaid | authorized | captured | transferred | refunded
            $table->unsignedInteger('platform_fee_cents')->default(0)->after('payment_status');
            $table->string('transfer_id')->nullable()->after('platform_fee_cents');
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn(['payment_intent_id', 'payment_status', 'platform_fee_cents', 'transfer_id']);
        });
    }
};
