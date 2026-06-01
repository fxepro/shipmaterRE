<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'shipper_id', 'carrier_id', 'shipment_id', 'payment_method_id',
        'invoice_no', 'description', 'category', 'pickup', 'delivery',
        'amount', 'status', 'due_date', 'notes', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount'   => 'float',
            'due_date'  => 'date',
            'paid_at'   => 'datetime',
        ];
    }

    public function shipper(): BelongsTo { return $this->belongsTo(User::class, 'shipper_id'); }
    public function carrier(): BelongsTo { return $this->belongsTo(User::class, 'carrier_id'); }
    public function shipment(): BelongsTo { return $this->belongsTo(Shipment::class); }
    public function paymentMethod(): BelongsTo { return $this->belongsTo(PaymentMethod::class); }
}
