<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['owner', 'admin', 'dispatcher', 'driver', 'viewer'])
                  ->default('viewer');
            $table->enum('status', ['active', 'invited', 'suspended'])->default('active');
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();
            $table->unique(['org_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_members');
    }
};
