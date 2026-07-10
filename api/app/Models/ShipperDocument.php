<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipperDocument extends Model
{
    protected $fillable = [
        'shipper_profile_id',
        'type', 'name', 'url', 'mime_type', 'size',
        'verified_by', 'verified_at', 'verification_notes',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    public function shipperProfile(): BelongsTo
    {
        return $this->belongsTo(ShipperProfile::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
