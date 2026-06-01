<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipperProfile extends Model
{
    protected $fillable = [
        'user_id',
        'phone', 'street', 'city', 'state', 'zip', 'country',
        'company_name', 'business_type', 'ein', 'industry', 'website',
        'biz_street', 'biz_city', 'biz_state', 'biz_zip',
        'notif_email', 'notif_sms',
    ];

    protected function casts(): array
    {
        return [
            'notif_email' => 'array',
            'notif_sms'   => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}