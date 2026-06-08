<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobStopItem extends Model
{
    protected $fillable = [
        'pickup_stop_id', 'delivery_stop_id',
        'description', 'quantity', 'unit', 'weight_lbs', 'sku', 'notes',
    ];

    public function pickupStop(): BelongsTo   { return $this->belongsTo(JobStop::class, 'pickup_stop_id'); }
    public function deliveryStop(): BelongsTo { return $this->belongsTo(JobStop::class, 'delivery_stop_id'); }
}
