<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            // Address (Personal tab — used for carrier search)
            $table->string('street')->nullable()->after('phone');
            $table->string('city', 100)->nullable()->after('street');
            $table->string('state', 2)->nullable()->after('city');
            $table->string('zip', 10)->nullable()->after('state');

            // Government-issued ID (Personal tab)
            $table->string('id_type', 10)->nullable()->after('zip');   // 'dl' | 'passport'
            $table->string('dl_number', 30)->nullable()->after('id_type');
            $table->string('dl_state', 2)->nullable()->after('dl_number');
            $table->date('dl_expiry')->nullable()->after('dl_state');
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'street', 'city', 'state', 'zip',
                'id_type', 'dl_number', 'dl_state', 'dl_expiry',
            ]);
        });
    }
};
