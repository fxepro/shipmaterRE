<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── job_stops: POD signature + stored PDF ──────────────────────────
        Schema::table('job_stops', function (Blueprint $table) {
            // Drawn signature captured on device (base64 PNG stored as file)
            $table->string('signature_key')->nullable()->after('carrier_notes');
            $table->string('signature_url')->nullable()->after('signature_key');
            $table->string('signature_name')->nullable()->after('signature_url');   // "Signed by: John Smith"
            $table->timestamp('signature_at')->nullable()->after('signature_name');
            $table->string('signature_ip', 45)->nullable()->after('signature_at');  // auditing

            // Generated POD PDF (stored once; null until generated)
            $table->string('pod_pdf_key')->nullable()->after('signature_ip');
            $table->string('pod_pdf_url')->nullable()->after('pod_pdf_key');
            $table->timestamp('pod_generated_at')->nullable()->after('pod_pdf_url');

            // Whether photos are required to mark this stop complete
            $table->boolean('photos_required')->default(false)->after('pod_generated_at');
        });

        // ── freight_jobs: stored BOL PDF ───────────────────────────────────
        Schema::table('freight_jobs', function (Blueprint $table) {
            $table->string('bol_pdf_key')->nullable()->after('posted_at');
            $table->string('bol_pdf_url')->nullable()->after('bol_pdf_key');
            $table->timestamp('bol_generated_at')->nullable()->after('bol_pdf_url');
        });

        // ── job_evidence: add signature type ──────────────────────────────
        // Extend the existing enum so 'signature' is a valid evidence_type.
        // PostgreSQL requires a different approach than MySQL for enum changes.
        // We add a raw check instead of modifying the enum column.
        Schema::table('job_evidence', function (Blueprint $table) {
            $table->string('evidence_type', 20)->change(); // widen from enum to string
        });
    }

    public function down(): void
    {
        Schema::table('job_stops', function (Blueprint $table) {
            $table->dropColumn([
                'signature_key', 'signature_url', 'signature_name',
                'signature_at', 'signature_ip',
                'pod_pdf_key', 'pod_pdf_url', 'pod_generated_at',
                'photos_required',
            ]);
        });

        Schema::table('freight_jobs', function (Blueprint $table) {
            $table->dropColumn(['bol_pdf_key', 'bol_pdf_url', 'bol_generated_at']);
        });
    }
};
