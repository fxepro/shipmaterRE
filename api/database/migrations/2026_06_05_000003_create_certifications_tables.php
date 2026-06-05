<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('certifications')
                  ->nullOnDelete();
            $table->string('key')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('category');
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('carrier_profile_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrier_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('certification_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['carrier_profile_id', 'certification_id'], 'carrier_cert_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carrier_profile_certifications');
        Schema::dropIfExists('certifications');
    }
};
