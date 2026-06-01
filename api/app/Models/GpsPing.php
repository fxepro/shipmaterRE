<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GpsPing extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'shipment_id',
        'lat',
        'lng',
        'speed',
        'eta',
        'pinged_at',
    ];

    protected function casts(): array
    {
        return [
            'lat'       => 'decimal:8',
            'lng'       => 'decimal:8',
            'speed'     => 'decimal:2',
            'pinged_at' => 'datetime',
        ];
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }
}
