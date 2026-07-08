<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipper_profiles', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->nullable()->after('id');
            $table->unsignedInteger('total_ratings')->default(0)->after('rating');
        });

        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->unsignedInteger('total_ratings')->default(0)->after('rating');
        });
    }

    public function down(): void
    {
        Schema::table('shipper_profiles', function (Blueprint $table) {
            $table->dropColumn(['rating', 'total_ratings']);
        });

        Schema::table('carrier_profiles', function (Blueprint $table) {
            $table->dropColumn('total_ratings');
        });
    }
};
