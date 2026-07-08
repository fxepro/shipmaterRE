<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('freight_job_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rater_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ratee_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('rater_org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('ratee_org_id')->constrained('organizations')->cascadeOnDelete();
            $table->enum('rater_type', ['shipper', 'carrier']);
            // 1–5 stars
            $table->unsignedTinyInteger('overall');
            $table->unsignedTinyInteger('communication');
            $table->unsignedTinyInteger('reliability');  // punctuality (carrier) | ease_of_access (shipper)
            $table->text('comment')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamps();

            // One rating per job per rater
            $table->unique(['freight_job_id', 'rater_id']);
            $table->index(['ratee_org_id', 'is_public']);
        });

        // Add total_ratings column to carrier_profiles if not already there
        Schema::table('carrier_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('carrier_profiles', 'total_ratings')) {
                $table->unsignedInteger('total_ratings')->default(0)->after('rating');
            }
        });

        // Add rating + total_ratings to shipper_profiles
        Schema::table('shipper_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('shipper_profiles', 'rating')) {
                $table->decimal('rating', 3, 2)->nullable()->after('id');
            }
            if (! Schema::hasColumn('shipper_profiles', 'total_ratings')) {
                $table->unsignedInteger('total_ratings')->default(0)->after('rating');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
