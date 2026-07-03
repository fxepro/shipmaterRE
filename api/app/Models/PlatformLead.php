<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PlatformLead extends Model
{
    protected $fillable = [
        'name',
        'email',
        'company',
        'role',
        'plan',
        'monthly_volume',
        'current_solution',
        'timeline',
        'message',
        'status',
        'ip_address',
        'org_id',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    /** Filled once this lead is converted into a provisioned tenant org. */
    public function org(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function platformTenant(): HasOne
    {
        return $this->hasOne(PlatformTenant::class, 'lead_id');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isConverted(): bool { return $this->org_id !== null; }
}
