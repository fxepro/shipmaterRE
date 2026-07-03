<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_leads', function (Blueprint $table) {
            // Filled once a lead is converted into a tenant org.
            // Null = still just a sales lead, not yet provisioned.
            $table->foreignId('org_id')
                  ->nullable()
                  ->after('ip_address')
                  ->constrained('organizations')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('platform_leads', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Organization::class);
            $table->dropColumn('org_id');
        });
    }
};
