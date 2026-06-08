<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->string('title')->nullable()->after('carrier_id');
            $table->enum('payment_schedule', [
                'immediate', 'daily', 'weekly', 'bi_weekly', 'monthly'
            ])->default('immediate')->after('payment_terms');
            $table->unsignedTinyInteger('payment_day')->nullable()->after('payment_schedule'); // 0-6 weekly, 1-28 monthly
            $table->timestamp('shipper_signed_at')->nullable()->after('signed_at');
            $table->json('terms_snapshot')->nullable()->after('notes');
            $table->enum('optimization_mode', ['cluster_pickups', 'shortest_route'])
                  ->default('shortest_route')->after('terms_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn([
                'title', 'payment_schedule', 'payment_day',
                'shipper_signed_at', 'terms_snapshot', 'optimization_mode',
            ]);
        });
    }
};
