<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipper_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('shipper_profiles', 'rating')) {
                $table->decimal('rating', 3, 2)->nullable()->after('id');
            }
            if (!Schema::hasColumn('shipper_profiles', 'total_ratings')) {
                $table->unsignedInteger('total_ratings')->default(0)->after('rating');
            }
        });

        Schema::table('carrier_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('carrier_profiles', 'total_ratings')) {
                $table->unsignedInteger('total_ratings')->default(0)->after('rating');
            }
        });
    }

    public function down(): void
    {
        Schema::table('shipper_profiles', function (Blueprint $table) {
            $cols = array_filter(['rating', 'total_ratings'], fn ($c) => Schema::hasColumn('shipper_profiles', $c));
            if ($cols) $table->dropColumn($cols);
        });

        Schema::table('carrier_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('carrier_profiles', 'total_ratings')) {
                $table->dropColumn('total_ratings');
            }
        });
    }
};
