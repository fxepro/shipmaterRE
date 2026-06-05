<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carrier_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrier_profile_id')->constrained('carrier_profiles')->cascadeOnDelete();

            $table->string('check_type', 50);
            // background | mvr | identity | fmcsa | insurance_auto | insurance_cargo | medical_cert

            $table->string('status', 30)->default('not_started');
            // not_started | pending | passed | failed | manual_review | expired

            $table->json('result_data')->nullable();     // raw API response (Checkr, FMCSA, Stripe)
            $table->string('external_id')->nullable();  // Checkr report ID, FMCSA query ID, etc.
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // when re-check is due

            $table->timestamps();

            $table->unique(['carrier_profile_id', 'check_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carrier_verifications');
    }
};
