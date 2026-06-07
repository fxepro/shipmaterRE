<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->boolean('mc_verified')->default(false)->after('dot_verified');
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->dropColumn('mc_verified');
        });
    }
};
