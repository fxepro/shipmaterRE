<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carrier_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrier_profile_id')->constrained('carrier_profiles')->cascadeOnDelete();
            $table->foreignId('carrier_vehicle_id')->nullable()->constrained('carrier_vehicles')->nullOnDelete();

            $table->string('type');           // cdl_front, cdl_back, insurance_auto, insurance_cargo,
                                              // medical_cert, vehicle_registration, vehicle_photo_front,
                                              // vehicle_photo_rear, vehicle_photo_cargo, dl_front, dl_back,
                                              // passport, selfie
            $table->string('name');           // original filename
            $table->string('url');            // storage URL
            $table->string('mime_type')->nullable();
            $table->bigInteger('size')->nullable(); // bytes

            // Insurance-specific
            $table->string('policy_number')->nullable();
            $table->string('insurer_name')->nullable();
            $table->decimal('coverage_amount', 12, 2)->nullable();
            $table->date('effective_date')->nullable();
            $table->date('expiry_date')->nullable();

            // Verification
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carrier_documents');
    }
};
