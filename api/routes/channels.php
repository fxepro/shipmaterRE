<?php

use App\Models\Shipment;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Private channel: shipment.{id}
// Authorized for: the shipper, the assigned carrier, the receiver, and platform admins
Broadcast::channel('shipment.{shipmentId}', function (User $user, int $shipmentId) {
    $shipment = Shipment::find($shipmentId);
    if (!$shipment) return false;

    return match ($user->role) {
        'admin'    => true,
        'shipper'  => $shipment->shipper_id  === $user->id,
        'carrier'  => $shipment->carrier_id  === $user->id,
        'receiver' => $shipment->receiver_id === $user->id,
        default    => false,
    };
});
