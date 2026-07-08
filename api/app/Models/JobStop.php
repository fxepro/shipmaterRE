<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobStop extends Model
{
    protected $fillable = [
        'freight_job_id', 'location_id', 'name', 'stop_type', 'sequence', 'optimized_sequence',
        'contact_name', 'contact_phone',
        'address', 'city', 'state', 'zip',
        'lat', 'lng',
        'scheduled_date', 'window_start', 'window_end', 'estimated_arrival_at',
        'weight_lbs', 'special_instructions',
        'status', 'en_route_at', 'arrived_at', 'completed_at', 'carrier_notes',
        // POD
        'signature_key', 'signature_url', 'signature_name', 'signature_at', 'signature_ip',
        'pod_pdf_key', 'pod_pdf_url', 'pod_generated_at',
        'photos_required',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date'      => 'date',
            'estimated_arrival_at'=> 'datetime',
            'en_route_at'         => 'datetime',
            'arrived_at'          => 'datetime',
            'completed_at'        => 'datetime',
            'signature_at'        => 'datetime',
            'pod_generated_at'    => 'datetime',
            'photos_required'     => 'boolean',
            'lat'                 => 'float',
            'lng'                 => 'float',
        ];
    }

    public function freightJob(): BelongsTo { return $this->belongsTo(FreightJob::class); }
    public function location(): BelongsTo   { return $this->belongsTo(Location::class); }
    public function evidence(): HasMany     { return $this->hasMany(JobEvidence::class, 'job_stop_id'); }

    // Items being picked up at this stop → delivers to various dropoffs
    public function pickupItems(): HasMany
    {
        return $this->hasMany(JobStopItem::class, 'pickup_stop_id');
    }

    // Items being delivered at this stop → came from various pickups
    public function deliveryItems(): HasMany
    {
        return $this->hasMany(JobStopItem::class, 'delivery_stop_id');
    }

    /**
     * Return IDs of all pickup stops that must be completed before this dropoff.
     */
    public function requiredPickupIds(): array
    {
        if ($this->stop_type !== 'dropoff') return [];
        return $this->deliveryItems()->pluck('pickup_stop_id')->unique()->values()->toArray();
    }
}
