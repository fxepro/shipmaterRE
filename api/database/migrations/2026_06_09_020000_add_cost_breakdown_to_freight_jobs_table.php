<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('freight_jobs', function (Blueprint $table) {
            $table->jsonb('cost_breakdown')->nullable()->after('route_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('freight_jobs', function (Blueprint $table) {
            $table->dropColumn('cost_breakdown');
        });
    }
};
