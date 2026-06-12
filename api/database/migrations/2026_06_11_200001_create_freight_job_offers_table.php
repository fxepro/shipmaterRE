<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('freight_job_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('freight_job_id')->constrained()->cascadeOnDelete();
            $table->foreignId('carrier_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->text('note')->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected', 'withdrawn'])->default('pending');
            $table->timestamps();

            // One offer per carrier per job
            $table->unique(['freight_job_id', 'carrier_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('freight_job_offers');
    }
};
