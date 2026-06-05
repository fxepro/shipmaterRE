<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipperProfile extends Model
{
    protected $fillable = [
        'user_id',
        // Personal
        'phone', 'street', 'city', 'state', 'zip', 'country',
        // Business identity
        'company_name', 'dba', 'business_type', 'ein',
        'state_of_incorporation', 'year_established', 'employee_count',
        'industry', 'website', 'business_phone', 'business_email', 'sam_gov_number',
        // Registered address
        'biz_street', 'biz_city', 'biz_state', 'biz_zip',
        // Operating address
        'ops_same_as_biz', 'ops_street', 'ops_city', 'ops_state', 'ops_zip',
        // Verification
        'verification_status', 'email_verified_at', 'phone_verified_at', 'ein_verified_at',
        // Shipping defaults
        'default_pickup_contact_name', 'default_pickup_contact_phone',
        'internal_ref_format', 'preferred_categories', 'notif_recipients',
        // Compliance
        'coi_url', 'coi_expiry', 'hipaa_baa_url', 'hipaa_baa_expiry',
        'hazmat_reg_url', 'hazmat_reg_expiry',
        // Notifications
        'notif_email', 'notif_sms',
    ];

    protected function casts(): array
    {
        return [
            'notif_email'          => 'array',
            'notif_sms'            => 'array',
            'preferred_categories' => 'array',
            'notif_recipients'     => 'array',
            'ops_same_as_biz'      => 'boolean',
            'coi_expiry'           => 'date',
            'hipaa_baa_expiry'     => 'date',
            'hazmat_reg_expiry'    => 'date',
            'email_verified_at'    => 'datetime',
            'phone_verified_at'    => 'datetime',
            'ein_verified_at'      => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}