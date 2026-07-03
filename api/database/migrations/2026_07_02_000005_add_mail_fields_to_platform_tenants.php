<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_tenants', function (Blueprint $table) {
            // ── Email identity (always shown) ──────────────────────────────────
            $table->string('mail_from_name')->nullable()->after('support_email');
            $table->string('mail_from_address')->nullable()->after('mail_from_name');

            // ── Sending driver ────────────────────────────────────────────────
            // 'default' = use Shipmater's mailer (from-name/address still overridden)
            // 'smtp' | 'postmark' | 'sendgrid' | 'mailgun' | 'ses' = tenant's own
            $table->string('mail_driver', 20)->default('default')->after('mail_from_address');

            // ── SMTP credentials (encrypted at rest) ──────────────────────────
            $table->string('mail_host')->nullable()->after('mail_driver');
            $table->unsignedSmallInteger('mail_port')->nullable()->after('mail_host');
            $table->string('mail_username')->nullable()->after('mail_port');
            $table->text('mail_password')->nullable()->after('mail_username');    // encrypted
            $table->string('mail_encryption', 10)->nullable()->after('mail_password'); // tls|ssl|null

            // ── API-based drivers (Postmark / SendGrid / Mailgun / SES) ───────
            $table->text('mail_api_key')->nullable()->after('mail_encryption');   // encrypted
            $table->string('mail_domain')->nullable()->after('mail_api_key');     // Mailgun domain
            $table->string('mail_region', 10)->nullable()->after('mail_domain');  // SES region
        });
    }

    public function down(): void
    {
        Schema::table('platform_tenants', function (Blueprint $table) {
            $table->dropColumn([
                'mail_from_name', 'mail_from_address', 'mail_driver',
                'mail_host', 'mail_port', 'mail_username', 'mail_password', 'mail_encryption',
                'mail_api_key', 'mail_domain', 'mail_region',
            ]);
        });
    }
};
