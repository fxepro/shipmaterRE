<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Location extends Model
{
    protected $fillable = [
        'shipper_id', 'org_id', 'type', 'name',
        'contact_name', 'contact_phone', 'contact_email',
        'address', 'city', 'state', 'zip', 'country',
        'lat', 'lng', 'operating_hours', 'notes',
        'is_default', 'usage_count',
    ];

    protected function casts(): array
    {
        return [
            'operating_hours' => 'array',
            'is_default'      => 'boolean',
            'lat'             => 'float',
            'lng'             => 'float',
        ];
    }

    public function shipper(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shipper_id');
    }

    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }
}
