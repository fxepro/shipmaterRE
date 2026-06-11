<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('freight_jobs', function (Blueprint $table) {
            // Open-market jobs have no contract or assigned carrier.
            // Contracted jobs still require both — enforced at the application layer.
            $table->foreignId('contract_id')->nullable()->change();
            $table->foreignId('carrier_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('freight_jobs', function (Blueprint $table) {
            $table->foreignId('contract_id')->nullable(false)->change();
            $table->foreignId('carrier_id')->nullable(false)->change();
        });
    }
};
