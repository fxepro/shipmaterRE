<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Organization extends Model
{
    protected $fillable = [
        'name', 'slug', 'type', 'plan', 'status', 'owner_id',
        'phone', 'email', 'website',
        'street', 'city', 'state', 'zip', 'country',
        'logo_url', 'settings',
    ];

    protected function casts(): array
    {
        return ['settings' => 'json'];
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'org_members')
                    ->withPivot('role', 'status', 'joined_at')
                    ->withTimestamps();
    }

    public function orgMembers(): HasMany
    {
        return $this->hasMany(OrgMember::class, 'org_id');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(OrgInvitation::class, 'org_id');
    }

    public function carrierProfile(): HasOne
    {
        return $this->hasOne(CarrierProfile::class, 'org_id');
    }

    public function shipperProfile(): HasOne
    {
        return $this->hasOne(ShipperProfile::class, 'org_id');
    }

    public function serviceTypes(): BelongsToMany
    {
        return $this->belongsToMany(ServiceType::class, 'org_service_types')
                    ->withTimestamps();
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'org_id');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isCarrier(): bool { return $this->type === 'carrier'; }
    public function isShipper(): bool { return $this->type === 'shipper'; }
    public function isActive():  bool { return $this->status === 'active'; }
}
