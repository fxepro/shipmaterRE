<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobEvidence extends Model
{
    protected $table = 'job_evidence';

    protected $fillable = [
        'freight_job_id', 'job_stop_id', 'uploaded_by',
        'evidence_type', 'file_key', 'file_url',
        'file_size_bytes', 'mime_type',
        'lat', 'lng', 'taken_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'taken_at' => 'datetime',
            'lat'      => 'float',
            'lng'      => 'float',
        ];
    }

    public function freightJob(): BelongsTo { return $this->belongsTo(FreightJob::class); }
    public function stop(): BelongsTo       { return $this->belongsTo(JobStop::class, 'job_stop_id'); }
    public function uploader(): BelongsTo   { return $this->belongsTo(User::class, 'uploaded_by'); }
}
