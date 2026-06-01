<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carrier_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('dot_number')->nullable();
            $table->boolean('dot_verified')->default(false);
            $table->string('mc_number')->nullable();
            $table->boolean('insurance_verified')->default(false);
            $table->enum('background_check_status', ['not_submitted', 'pending', 'approved', 'rejected'])
                  ->default('not_submitted');
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->unsignedInteger('total_deliveries')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carrier_profiles');
    }
};
