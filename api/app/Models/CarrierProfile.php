<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarrierProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'phone',
        'dot_number',
        'dot_verified',
        'mc_number',
        'insurance_verified',
        'background_check_status',
        'rating',
        'total_deliveries',
    ];

    protected function casts(): array
    {
        return [
            'dot_verified'        => 'boolean',
            'insurance_verified'  => 'boolean',
            'rating'              => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
