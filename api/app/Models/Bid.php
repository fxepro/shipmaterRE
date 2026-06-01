<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bid extends Model
{
    protected $fillable = [
        'shipment_id',
        'carrier_id',
        'amount',
        'estimated_pickup_date',
        'estimated_delivery_date',
        'note',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount'                  => 'decimal:2',
            'estimated_pickup_date'   => 'date',
            'estimated_delivery_date' => 'date',
        ];
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    public function carrier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'carrier_id');
    }
}