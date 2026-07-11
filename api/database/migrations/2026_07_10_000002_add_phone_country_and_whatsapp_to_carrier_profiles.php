<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('carrier_profiles', 'phone_country_code')) {
                $table->string('phone_country_code', 2)->nullable()->after('phone');
            }
            if (! Schema::hasColumn('carrier_profiles', 'whatsapp')) {
                $table->string('whatsapp', 40)->nullable()->after('phone_e164');
            }
            if (! Schema::hasColumn('carrier_profiles', 'whatsapp_country_code')) {
                $table->string('whatsapp_country_code', 2)->nullable()->after('whatsapp');
            }
        });
    }

    public function down(): void
    {
        Schema::table('carrier_profiles', function (Blueprint $table) {
            foreach (['phone_country_code', 'whatsapp', 'whatsapp_country_code'] as $col) {
                if (Schema::hasColumn('carrier_profiles', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
