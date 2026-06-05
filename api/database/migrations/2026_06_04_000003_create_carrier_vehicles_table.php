<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carrier_vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrier_profile_id')->constrained('carrier_profiles')->cascadeOnDelete();

            // Identity
            $table->string('type');                          // box_truck, flatbed, etc.
            $table->string('year', 4);
            $table->string('make');
            $table->string('model');
            $table->string('vin')->nullable();
            $table->string('license_plate')->nullable();
            $table->string('license_plate_state', 2)->nullable();

            // Capacity
            $table->decimal('gvwr', 10, 2)->nullable();      // lbs
            $table->decimal('max_payload', 10, 2)->nullable(); // lbs
            $table->decimal('cargo_length', 8, 2)->nullable(); // inches
            $table->decimal('cargo_width', 8, 2)->nullable();
            $table->decimal('cargo_height', 8, 2)->nullable();

            // Features
            $table->boolean('liftgate')->default(false);
            $table->boolean('climate_controlled')->default(false);
            $table->boolean('enclosed')->default(false);
            $table->boolean('is_primary')->default(false);

            // Registration
            $table->date('registration_expiry')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carrier_vehicles');
    }
};
