<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('company');
            $table->string('role')->nullable();
            $table->string('plan')->nullable();              // startup | growth | enterprise | unsure
            $table->string('monthly_volume')->nullable();
            $table->string('current_solution')->nullable();
            $table->string('timeline')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('new');        // new | contacted | qualified | won | lost
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_leads');
    }
};
