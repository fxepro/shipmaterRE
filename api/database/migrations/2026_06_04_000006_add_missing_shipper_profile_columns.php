<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipper_profiles', function (Blueprint $table) {
            // Business identity
            if (!Schema::hasColumn('shipper_profiles', 'dba'))
                $table->string('dba')->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'state_of_incorporation'))
                $table->string('state_of_incorporation', 2)->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'year_established'))
                $table->string('year_established', 4)->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'employee_count'))
                $table->string('employee_count')->nullable(); // range: '1-10', '11-50', etc.
            if (!Schema::hasColumn('shipper_profiles', 'business_phone'))
                $table->string('business_phone', 40)->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'business_email'))
                $table->string('business_email')->nullable();

            // Operating address (if different from registered)
            if (!Schema::hasColumn('shipper_profiles', 'ops_street'))
                $table->string('ops_street', 200)->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'ops_city'))
                $table->string('ops_city', 100)->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'ops_state'))
                $table->string('ops_state', 50)->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'ops_zip'))
                $table->string('ops_zip', 20)->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'ops_same_as_biz'))
                $table->boolean('ops_same_as_biz')->default(true);

            // Verification
            if (!Schema::hasColumn('shipper_profiles', 'verification_status'))
                $table->string('verification_status', 30)->default('incomplete');
            if (!Schema::hasColumn('shipper_profiles', 'email_verified_at'))
                $table->timestamp('email_verified_at')->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'phone_verified_at'))
                $table->timestamp('phone_verified_at')->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'ein_verified_at'))
                $table->timestamp('ein_verified_at')->nullable();

            // Shipping defaults
            if (!Schema::hasColumn('shipper_profiles', 'default_pickup_contact_name'))
                $table->string('default_pickup_contact_name')->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'default_pickup_contact_phone'))
                $table->string('default_pickup_contact_phone', 40)->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'internal_ref_format'))
                $table->string('internal_ref_format')->nullable(); // e.g. 'PO-{number}', 'CC-{code}'
            if (!Schema::hasColumn('shipper_profiles', 'preferred_categories'))
                $table->json('preferred_categories')->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'notif_recipients'))
                $table->json('notif_recipients')->nullable(); // extra email addresses

            // Compliance documents (stored as JSON refs to uploaded files)
            if (!Schema::hasColumn('shipper_profiles', 'coi_url'))
                $table->string('coi_url')->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'coi_expiry'))
                $table->date('coi_expiry')->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'hipaa_baa_url'))
                $table->string('hipaa_baa_url')->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'hipaa_baa_expiry'))
                $table->date('hipaa_baa_expiry')->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'hazmat_reg_url'))
                $table->string('hazmat_reg_url')->nullable();
            if (!Schema::hasColumn('shipper_profiles', 'hazmat_reg_expiry'))
                $table->date('hazmat_reg_expiry')->nullable();

            // SAM.gov
            if (!Schema::hasColumn('shipper_profiles', 'sam_gov_number'))
                $table->string('sam_gov_number')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('shipper_profiles', function (Blueprint $table) {
            $cols = [
                'dba','state_of_incorporation','year_established','employee_count',
                'business_phone','business_email',
                'ops_street','ops_city','ops_state','ops_zip','ops_same_as_biz',
                'verification_status','email_verified_at','phone_verified_at','ein_verified_at',
                'default_pickup_contact_name','default_pickup_contact_phone',
                'internal_ref_format','preferred_categories','notif_recipients',
                'coi_url','coi_expiry','hipaa_baa_url','hipaa_baa_expiry',
                'hazmat_reg_url','hazmat_reg_expiry','sam_gov_number',
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('shipper_profiles', $col))
                    $table->dropColumn($col);
            }
        });
    }
};
