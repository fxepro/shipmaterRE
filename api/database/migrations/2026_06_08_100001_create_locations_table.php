<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipper_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('org_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->enum('type', ['pickup', 'delivery', 'both'])->default('pickup');
            $table->string('name');
            $table->string('contact_name')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('state', 10);
            $table->string('zip', 20);
            $table->string('country', 5)->default('US');
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->json('operating_hours')->nullable(); // { mon: "08:00-17:00", ... }
            $table->text('notes')->nullable();
            $table->boolean('is_default')->default(false);
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamps();

            $table->index(['shipper_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
