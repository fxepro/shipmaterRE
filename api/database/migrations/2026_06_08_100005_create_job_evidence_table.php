<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_evidence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('freight_job_id')->constrained('freight_jobs')->cascadeOnDelete();
            $table->foreignId('job_stop_id')->constrained('job_stops')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->enum('evidence_type', ['pickup', 'dropoff', 'damage', 'other']);
            $table->string('file_key'); // S3/R2 storage key
            $table->string('file_url'); // CDN URL
            $table->unsignedInteger('file_size_bytes')->nullable();
            $table->string('mime_type', 50)->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->timestamp('taken_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['freight_job_id', 'job_stop_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_evidence');
    }
};
