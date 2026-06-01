<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShipmentResource;
use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackController extends Controller
{
    // GET /api/v1/track/{token}  — public tracking by token
    public function show(string $token): JsonResponse
    {
        $shipment = Shipment::where('tracking_token', strtoupper($token))
            ->with(['carrier', 'shipper', 'latestPing'])
            ->firstOrFail();

        return response()->json([
            'data' => new ShipmentResource($shipment),
        ]);
    }

    // POST /api/v1/track/{token}  — receiver confirms delivery
    public function confirm(Request $request, string $token): JsonResponse
    {
        $shipment = Shipment::where('tracking_token', strtoupper($token))
            ->whereIn('status', ['in_transit', 'assigned'])
            ->firstOrFail();

        $shipment->update([
            'status'       => 'delivered',
            'delivered_at' => now(),
        ]);

        return response()->json([
            'data'    => new ShipmentResource($shipment->fresh(['carrier', 'shipper'])),
            'message' => 'Delivery confirmed.',
        ]);
    }
}
