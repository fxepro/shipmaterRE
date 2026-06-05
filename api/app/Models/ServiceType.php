<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ServiceType extends Model
{
    protected $fillable = [
        'key', 'name', 'description', 'icon', 'category',
        'requires_dot', 'requires_mc', 'requires_cdl', 'requires_hazmat',
        'active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'requires_dot'    => 'boolean',
            'requires_mc'     => 'boolean',
            'requires_cdl'    => 'boolean',
            'requires_hazmat' => 'boolean',
            'active'          => 'boolean',
        ];
    }

    public function carrierProfiles(): BelongsToMany
    {
        return $this->belongsToMany(CarrierProfile::class, 'carrier_profile_service_types');
    }
}
