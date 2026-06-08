<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_stop_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pickup_stop_id')->constrained('job_stops')->cascadeOnDelete();
            $table->foreignId('delivery_stop_id')->constrained('job_stops')->cascadeOnDelete();
            $table->string('description');
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->enum('unit', ['pallet', 'box', 'piece', 'bag', 'drum', 'crate', 'other'])->default('pallet');
            $table->unsignedInteger('weight_lbs')->nullable();
            $table->string('sku')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('pickup_stop_id');
            $table->index('delivery_stop_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_stop_items');
    }
};
