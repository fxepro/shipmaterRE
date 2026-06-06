<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Org-level service types (what the company offers)
        Schema::create('org_service_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('service_type_id')->constrained('service_types')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['org_id', 'service_type_id']);
        });

        // Migrate existing carrier_profile_service_types data to org_service_types
        // (runs after orgs are created in the data migration seeder)
    }

    public function down(): void
    {
        Schema::dropIfExists('org_service_types');
    }
};
