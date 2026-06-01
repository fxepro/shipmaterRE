<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipper_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('carrier_id')->constrained('users')->cascadeOnDelete();
            $table->string('rate_type', 20);            // Per mile | Flat rate | Hourly
            $table->decimal('rate', 10, 2);
            $table->decimal('fuel_surcharge', 8, 2)->nullable();
            $table->decimal('detention_rate', 8, 2)->nullable();
            $table->unsignedTinyInteger('free_time_hrs')->default(2);
            $table->string('equipment_type', 30)->nullable();
            $table->unsignedInteger('max_weight_lbs')->nullable();
            $table->string('coverage', 200);
            $table->string('payment_terms', 20)->default('Net 30');
            $table->string('priority', 20)->default('Standard');
            $table->boolean('auto_renew')->default(false);
            $table->date('valid_from');
            $table->date('valid_to');
            $table->string('status', 20)->default('pending'); // active|pending|expired|draft
            $table->text('notes')->nullable();
            $table->unsignedInteger('shipments_under')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
