<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            // ISO 4217 currency code — defaults to USD
            $table->string('currency', 3)->default('USD')->after('country');
        });

        Schema::table('freight_jobs', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD')->after('payment_status');
        });

        // Shipments (open market) — same
        Schema::table('shipments', function (Blueprint $table) {
            if (! Schema::hasColumn('shipments', 'currency')) {
                $table->string('currency', 3)->default('USD')->after('agreed_cost');
            }
        });
    }

    public function down(): void
    {
        Schema::table('organizations', fn ($t) => $t->dropColumn('currency'));
        Schema::table('freight_jobs',  fn ($t) => $t->dropColumn('currency'));
        Schema::table('shipments', function ($t) {
            if (Schema::hasColumn('shipments', 'currency')) {
                $t->dropColumn('currency');
            }
        });
    }
};
