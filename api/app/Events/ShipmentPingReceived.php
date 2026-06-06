<?php

namespace App\Events;

use App\Models\GpsPing;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShipmentPingReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public GpsPing $ping) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("shipment.{$this->ping->shipment_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ping.received';
    }

    public function broadcastWith(): array
    {
        return [
            'id'          => $this->ping->id,
            'shipment_id' => $this->ping->shipment_id,
            'lat'         => (float) $this->ping->lat,
            'lng'         => (float) $this->ping->lng,
            'speed'       => $this->ping->speed ? (float) $this->ping->speed : null,
            'eta'         => $this->ping->eta,
            'pinged_at'   => $this->ping->pinged_at?->toISOString(),
        ];
    }
}
