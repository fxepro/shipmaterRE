<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────

    public function carrierProfile(): HasOne
    {
        return $this->hasOne(CarrierProfile::class);
    }

    /** Shipments this user dispatched as a shipper */
    public function dispatchedShipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'shipper_id');
    }

    /** Shipments assigned to this user as a carrier */
    public function assignedShipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'carrier_id');
    }

    /** Shipments where this user is the receiver */
    public function inboundShipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'receiver_id');
    }

    /** Saved payment methods (cards + ACH bank accounts) */
    public function paymentMethods(): HasMany
    {
        return $this->hasMany(PaymentMethod::class);
    }

    /** Transactions as shipper */
    public function transactions(): HasMany
    {
        return $this->hasMany(\App\Models\Transaction::class, 'shipper_id');
    }

    /** Preferred carrier links (shipper → carrier) */
    public function preferredCarriers(): HasMany
    {
        return $this->hasMany(\App\Models\PreferredCarrier::class, 'shipper_id');
    }

    /** Contracts created by this shipper */
    public function contracts(): HasMany
    {
        return $this->hasMany(\App\Models\Contract::class, 'shipper_id');
    }

    /** Shipper profile (business details + notification prefs) */
    public function shipperProfile(): HasOne
    {
        return $this->hasOne(\App\Models\ShipperProfile::class);
    }

    // ── Helpers ────────────────────────────────────────────────────────

    public function isShipper(): bool  { return $this->role === 'shipper'; }
    public function isCarrier(): bool  { return $this->role === 'carrier'; }
    public function isReceiver(): bool { return $this->role === 'receiver'; }
    public function isAdmin(): bool    { return $this->role === 'admin'; }
}
