<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_types', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('category'); // commercial, medical, specialized, local
            $table->boolean('requires_dot')->default(false);
            $table->boolean('requires_mc')->default(false);
            $table->boolean('requires_cdl')->default(false);
            $table->boolean('requires_hazmat')->default(false);
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('carrier_profile_service_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrier_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_type_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['carrier_profile_id', 'service_type_id'], 'carrier_service_type_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carrier_profile_service_types');
        Schema::dropIfExists('service_types');
    }
};
