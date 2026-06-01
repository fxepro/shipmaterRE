<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    protected $fillable = [
        'shipper_id', 'carrier_id',
        'rate_type', 'rate', 'fuel_surcharge', 'detention_rate', 'free_time_hrs',
        'equipment_type', 'max_weight_lbs', 'coverage',
        'payment_terms', 'priority', 'auto_renew',
        'valid_from', 'valid_to', 'status', 'notes', 'shipments_under',
    ];

    protected function casts(): array
    {
        return [
            'rate'           => 'float',
            'fuel_surcharge' => 'float',
            'detention_rate' => 'float',
            'auto_renew'     => 'boolean',
            'valid_from'     => 'date',
            'valid_to'       => 'date',
        ];
    }

    public function shipper(): BelongsTo { return $this->belongsTo(User::class, 'shipper_id'); }
    public function carrier(): BelongsTo { return $this->belongsTo(User::class, 'carrier_id'); }
}
