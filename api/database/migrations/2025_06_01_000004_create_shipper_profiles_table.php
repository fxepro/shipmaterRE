<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipper_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Personal contact
            $table->string('phone', 40)->nullable();
            $table->string('street', 200)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 50)->nullable();
            $table->string('zip', 20)->nullable();
            $table->string('country', 100)->nullable()->default('United States');

            // Business
            $table->string('company_name', 200)->nullable();
            $table->string('business_type', 100)->nullable();
            $table->string('ein', 30)->nullable();
            $table->string('industry', 100)->nullable();
            $table->string('website', 255)->nullable();
            $table->string('biz_street', 200)->nullable();
            $table->string('biz_city', 100)->nullable();
            $table->string('biz_state', 50)->nullable();
            $table->string('biz_zip', 20)->nullable();

            // Notification preferences (JSON)
            $table->json('notif_email')->nullable();
            $table->json('notif_sms')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipper_profiles');
    }
};