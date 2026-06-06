<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Active org context — which org dashboard to show on login
            $table->foreignId('current_org_id')
                  ->nullable()
                  ->after('role')
                  ->constrained('organizations')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_org_id']);
            $table->dropColumn('current_org_id');
        });
    }
};
