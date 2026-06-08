<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('freight_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->foreignId('shipper_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('carrier_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('org_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->string('title')->nullable();
            $table->string('reference_number')->nullable();
            $table->text('special_instructions')->nullable();
            $table->unsignedInteger('total_weight_lbs')->nullable();
            $table->enum('status', [
                'draft', 'posted', 'in_progress', 'completed', 'cancelled', 'disputed'
            ])->default('draft');
            $table->enum('optimization_mode', ['cluster_pickups', 'shortest_route'])->default('shortest_route');
            $table->decimal('route_distance_miles', 8, 2)->nullable();
            $table->unsignedInteger('route_duration_minutes')->nullable();
            $table->timestamp('route_optimized_at')->nullable();
            $table->json('route_snapshot')->nullable(); // full optimization result
            $table->unsignedBigInteger('payment_amount_cents')->nullable();
            $table->enum('payment_status', ['unpaid', 'processing', 'paid'])->default('unpaid');
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();

            $table->index(['shipper_id', 'status']);
            $table->index(['carrier_id', 'status']);
            $table->index('contract_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('freight_jobs');
    }
};
