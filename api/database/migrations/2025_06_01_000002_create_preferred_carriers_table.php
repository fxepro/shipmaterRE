<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preferred_carriers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipper_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('carrier_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 20)->default('active'); // active|pending|inactive
            $table->timestamps();
            $table->unique(['shipper_id', 'carrier_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preferred_carriers');
    }
};
