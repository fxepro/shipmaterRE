<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('freight_job_id')->constrained('freight_jobs')->cascadeOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->enum('stop_type', ['pickup', 'dropoff']);
            $table->unsignedTinyInteger('sequence'); // planned order (1, 2, 3...)
            $table->unsignedTinyInteger('optimized_sequence')->nullable(); // after optimization
            $table->string('contact_name')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('state', 10);
            $table->string('zip', 20);
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->date('scheduled_date')->nullable();
            $table->time('window_start')->nullable();
            $table->time('window_end')->nullable();
            $table->timestamp('estimated_arrival_at')->nullable();
            $table->unsignedInteger('weight_lbs')->nullable();
            $table->text('special_instructions')->nullable();
            $table->enum('status', ['pending', 'en_route', 'arrived', 'completed'])->default('pending');
            $table->timestamp('en_route_at')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('carrier_notes')->nullable();
            $table->timestamps();

            $table->index(['freight_job_id', 'optimized_sequence']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_stops');
    }
};
