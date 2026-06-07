<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RoutingService
{
    // OSRM public demo — free, no API key, S3-compatible GeoJSON output.
    // Returns actual road-following polyline, distance, and duration.

    public function getRoute(float $pickupLat, float $pickupLng, float $deliveryLat, float $deliveryLng): ?array
    {
        $coords = "{$pickupLng},{$pickupLat};{$deliveryLng},{$deliveryLat}";

        $response = Http::timeout(10)
            ->get("https://router.project-osrm.org/route/v1/driving/{$coords}", [
                'overview'   => 'full',
                'geometries' => 'geojson',
            ]);

        if (!$response->successful()) {
            Log::warning('[Routing] OSRM request failed', [
                'status' => $response->status(),
                'coords' => $coords,
            ]);
            return null;
        }

        $data   = $response->json();
        $routes = $data['routes'] ?? [];

        if (empty($routes)) return null;

        $route = $routes[0];

        return [
            // [[lng, lat], ...] — GeoJSON coordinate order, ready for MapLibre
            'polyline'         => $route['geometry']['coordinates'],
            'distance_meters'  => $route['distance'],
            'distance_miles'   => round($route['distance'] * 0.000621371, 2),
            'duration_seconds' => $route['duration'],
            'duration_mins'    => round($route['duration'] / 60),
        ];
    }
}
