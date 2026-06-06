<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['carrier_vehicles', 'carrier_documents', 'carrier_verifications'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->foreignId('org_id')->nullable()->after('carrier_profile_id')
                  ->constrained('organizations')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach (['carrier_vehicles', 'carrier_documents', 'carrier_verifications'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropForeign(['org_id']);
                $t->dropColumn('org_id');
            });
        }
    }
};
