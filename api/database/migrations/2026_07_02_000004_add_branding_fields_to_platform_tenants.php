<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_tenants', function (Blueprint $table) {
            // DBA name for generated documents only — all other legal info lives in the org profile
            $table->string('dba_name')->nullable()->after('brand_name');

            // Email sending identity + credentials
            $table->string('mail_from_name')->nullable()->after('billing_email');
            $table->string('mail_from_address')->nullable()->after('mail_from_name');
            $table->string('mail_driver', 20)->default('default')->after('mail_from_address');
            $table->string('mail_host')->nullable()->after('mail_driver');
            $table->unsignedSmallInteger('mail_port')->nullable()->after('mail_host');
            $table->string('mail_username')->nullable()->after('mail_port');
            $table->text('mail_password')->nullable()->after('mail_username');
            $table->string('mail_encryption', 10)->nullable()->after('mail_password');
            $table->text('mail_api_key')->nullable()->after('mail_encryption');
            $table->string('mail_domain')->nullable()->after('mail_api_key');
            $table->string('mail_region', 10)->nullable()->after('mail_domain');
        });
    }

    public function down(): void
    {
        Schema::table('platform_tenants', function (Blueprint $table) {
            $table->dropColumn([
                'dba_name',
                'mail_from_name', 'mail_from_address', 'mail_driver',
                'mail_host', 'mail_port', 'mail_username', 'mail_password', 'mail_encryption',
                'mail_api_key', 'mail_domain', 'mail_region',
            ]);
        });
    }
};
