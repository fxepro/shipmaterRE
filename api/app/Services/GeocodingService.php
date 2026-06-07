<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeocodingService
{
    // Nominatim — OSM-based, free, no API key required.
    // ToS requires a valid User-Agent and max 1 req/second.

    public function geocode(string $address, string $city = '', string $state = '', string $zip = ''): ?array
    {
        $query = collect([$address, $city, $state, $zip, 'USA'])
            ->filter()
            ->implode(', ');

        $response = Http::timeout(8)
            ->withHeaders(['User-Agent' => 'Shipmater/1.0'])
            ->get('https://nominatim.openstreetmap.org/search', [
                'q'            => $query,
                'format'       => 'json',
                'limit'        => 1,
                'countrycodes' => 'us',
            ]);

        if (!$response->successful()) {
            Log::warning('[Geocoding] Request failed', ['query' => $query, 'status' => $response->status()]);
            return null;
        }

        $results = $response->json();

        if (empty($results)) {
            // Retry with just city + state if full address fails
            if ($city && $state) {
                return $this->geocode('', $city, $state, $zip);
            }
            return null;
        }

        return [
            'lat' => (float) $results[0]['lat'],
            'lng' => (float) $results[0]['lon'],
        ];
    }
}
