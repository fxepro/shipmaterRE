<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();

            // Parties
            $table->foreignId('shipper_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('carrier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('receiver_id')->nullable()->constrained('users')->nullOnDelete();

            // Status
            $table->enum('status', [
                'pending', 'assigned', 'in_transit', 'delivered', 'disputed', 'cancelled'
            ])->default('pending');

            // Item details
            $table->string('item_description');
            $table->string('item_category')->nullable();
            $table->decimal('weight_lbs', 10, 2)->nullable();
            $table->json('handling_requirements')->nullable();
            $table->text('special_notes')->nullable();

            // Pickup
            $table->string('pickup_address');
            $table->string('pickup_city')->nullable();
            $table->string('pickup_state')->nullable();
            $table->decimal('pickup_lat', 10, 8)->nullable();
            $table->decimal('pickup_lng', 11, 8)->nullable();
            $table->string('pickup_contact_name')->nullable();
            $table->string('pickup_contact_phone')->nullable();
            $table->date('pickup_date')->nullable();
            $table->string('pickup_time_window')->nullable();

            // Delivery
            $table->string('delivery_address');
            $table->string('delivery_city')->nullable();
            $table->string('delivery_state')->nullable();
            $table->decimal('delivery_lat', 10, 8)->nullable();
            $table->decimal('delivery_lng', 11, 8)->nullable();
            $table->string('delivery_contact_name')->nullable();
            $table->string('delivery_contact_phone')->nullable();
            $table->date('delivery_date')->nullable();
            $table->string('delivery_time_window')->nullable();

            // Route metrics
            $table->decimal('distance_miles', 10, 2)->nullable();
            $table->unsignedInteger('estimated_duration_mins')->nullable();

            // Cost
            $table->decimal('agreed_cost', 10, 2)->nullable();

            // Tracking
            $table->string('tracking_token')->unique()->nullable();

            // Delivery confirmation
            $table->timestamp('delivered_at')->nullable();
            $table->string('delivery_photo_url')->nullable();

            // Route polyline (Google Directions encoded)
            $table->text('route_polyline')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
