<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipper_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipper_profile_id')->constrained('shipper_profiles')->cascadeOnDelete();
            $table->string('type', 40); // w9 | articles | other
            $table->string('name');
            $table->string('url'); // R2 path or local path
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_notes')->nullable();
            $table->timestamps();

            $table->index(['shipper_profile_id', 'type']);
        });

        Schema::table('shipper_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('shipper_profiles', 'verification_notes')) {
                $table->text('verification_notes')->nullable()->after('verification_status');
            }
            if (!Schema::hasColumn('shipper_profiles', 'verification_submitted_at')) {
                $table->timestamp('verification_submitted_at')->nullable()->after('verification_notes');
            }
            if (!Schema::hasColumn('shipper_profiles', 'phone_e164')) {
                $table->string('phone_e164', 20)->nullable()->after('phone');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipper_documents');

        Schema::table('shipper_profiles', function (Blueprint $table) {
            foreach (['verification_notes', 'verification_submitted_at', 'phone_e164'] as $col) {
                if (Schema::hasColumn('shipper_profiles', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
