<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->timestamp('signed_at')->nullable()->after('notes');
            $table->timestamp('carrier_response_at')->nullable()->after('signed_at');
            $table->string('carrier_declined_reason')->nullable()->after('carrier_response_at');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['signed_at', 'carrier_response_at', 'carrier_declined_reason']);
        });
    }
};
