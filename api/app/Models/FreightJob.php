<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FreightJob extends Model
{
    protected $table = 'freight_jobs';

    protected $fillable = [
        'contract_id', 'shipper_id', 'carrier_id', 'org_id',
        'title', 'reference_number', 'special_instructions',
        'total_weight_lbs', 'status', 'optimization_mode',
        'route_distance_miles', 'route_duration_minutes',
        'route_optimized_at', 'route_snapshot', 'cost_breakdown',
        'quote_requirements',
        'payment_amount_cents', 'payment_status', 'posted_at',
        'bol_pdf_key', 'bol_pdf_url', 'bol_generated_at',
    ];

    protected function casts(): array
    {
        return [
            'route_snapshot'        => 'array',
            'cost_breakdown'        => 'array',
            'quote_requirements'    => 'array',
            'route_optimized_at'    => 'datetime',
            'posted_at'             => 'datetime',
            'bol_generated_at'      => 'datetime',
            'route_distance_miles'  => 'float',
        ];
    }

    public function contract(): BelongsTo  { return $this->belongsTo(Contract::class); }
    public function shipper(): BelongsTo   { return $this->belongsTo(User::class, 'shipper_id'); }
    public function carrier(): BelongsTo   { return $this->belongsTo(User::class, 'carrier_id'); }
    public function stops(): HasMany       { return $this->hasMany(JobStop::class)->orderBy('optimized_sequence')->orderBy('sequence'); }
    public function evidence(): HasMany    { return $this->hasMany(JobEvidence::class); }
    public function offers(): HasMany      { return $this->hasMany(FreightJobOffer::class)->latest(); }

    public function pickupStops(): HasMany
    {
        return $this->hasMany(JobStop::class)->where('stop_type', 'pickup')->orderBy('optimized_sequence')->orderBy('sequence');
    }

    public function deliveryStops(): HasMany
    {
        return $this->hasMany(JobStop::class)->where('stop_type', 'dropoff')->orderBy('optimized_sequence')->orderBy('sequence');
    }
}
