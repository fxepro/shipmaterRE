<?php

namespace App\Services;

class RouteOptimizationService
{
    /**
     * Optimize stop order using nearest-neighbour + 2-opt improvement.
     *
     * @param  array  $stops  Each stop: ['id'=>int,'lat'=>float,'lng'=>float,
     *                         'type'=>'pickup'|'dropoff','required_pickups'=>int[]]
     * @param  string $mode   'shortest_route' | 'cluster_pickups'
     * @return array  ['sequence'=>int[], 'distance_miles'=>float, 'duration_minutes'=>int]
     */
    public function optimize(array $stops, string $mode = 'shortest_route'): array
    {
        if (count($stops) === 0) {
            return ['sequence' => [], 'distance_miles' => 0, 'duration_minutes' => 0];
        }

        if (count($stops) === 1) {
            return ['sequence' => [$stops[0]['id']], 'distance_miles' => 0, 'duration_minutes' => 0];
        }

        $route = $mode === 'cluster_pickups'
            ? $this->clusterPickupsFirst($stops)
            : $this->nearestNeighbour($stops);

        $route = $this->twoOpt($stops, $route);

        $distance = $this->totalDistance($route, $this->indexById($stops));
        $duration  = (int) ceil(($distance / 50) * 60); // assume avg 50 mph

        return [
            'sequence'         => $route,
            'distance_miles'   => round($distance, 2),
            'duration_minutes' => $duration,
        ];
    }

    // ── Nearest-neighbour ────────────────────────────────────────────────────

    private function nearestNeighbour(array $stops): array
    {
        $map     = $this->indexById($stops);
        $visited = [];
        $route   = [];

        $current = $this->firstEligible($stops, $visited);
        $visited[$current['id']] = true;
        $route[] = $current['id'];

        while (count($route) < count($stops)) {
            $eligible = $this->eligible($stops, $visited);
            if (empty($eligible)) break;

            $nearest  = $this->nearest($current, $eligible);
            $visited[$nearest['id']] = true;
            $route[]  = $nearest['id'];
            $current  = $nearest;
        }

        return $route;
    }

    // ── 2-opt improvement ────────────────────────────────────────────────────

    private function twoOpt(array $stops, array $route): array
    {
        $map      = $this->indexById($stops);
        $best     = $this->totalDistance($route, $map);
        $improved = true;

        while ($improved) {
            $improved = false;
            $n = count($route);

            for ($i = 0; $i < $n - 1; $i++) {
                for ($j = $i + 1; $j < $n; $j++) {
                    $candidate = $this->swap2opt($route, $i, $j);

                    if (!$this->isValid($candidate, $map)) continue;

                    $d = $this->totalDistance($candidate, $map);
                    if ($d < $best - 0.001) {
                        $route    = $candidate;
                        $best     = $d;
                        $improved = true;
                    }
                }
            }
        }

        return $route;
    }

    private function swap2opt(array $route, int $i, int $j): array
    {
        return array_merge(
            array_slice($route, 0, $i),
            array_reverse(array_slice($route, $i, $j - $i + 1)),
            array_slice($route, $j + 1)
        );
    }

    // ── Cluster mode: all pickups first, then optimise dropoffs ──────────────

    private function clusterPickupsFirst(array $stops): array
    {
        $pickups  = array_values(array_filter($stops, fn($s) => $s['type'] === 'pickup'));
        $dropoffs = array_values(array_filter($stops, fn($s) => $s['type'] === 'dropoff'));

        $pickupRoute  = count($pickups)  > 0 ? $this->nearestNeighbour($pickups)  : [];
        $dropoffRoute = count($dropoffs) > 0 ? $this->nearestNeighbour($dropoffs) : [];

        return array_merge($pickupRoute, $dropoffRoute);
    }

    // ── Constraint validation ────────────────────────────────────────────────

    private function isValid(array $route, array $map): bool
    {
        $visited = [];
        foreach ($route as $id) {
            $stop = $map[$id];
            if ($stop['type'] === 'dropoff' && !empty($stop['required_pickups'])) {
                foreach ($stop['required_pickups'] as $pid) {
                    if (!isset($visited[$pid])) return false;
                }
            }
            $visited[$id] = true;
        }
        return true;
    }

    // ── Eligibility helpers ──────────────────────────────────────────────────

    private function eligible(array $stops, array $visited): array
    {
        return array_values(array_filter($stops, function ($s) use ($visited) {
            if (isset($visited[$s['id']])) return false;
            if ($s['type'] === 'pickup') return true;
            foreach ($s['required_pickups'] as $pid) {
                if (!isset($visited[$pid])) return false;
            }
            return true;
        }));
    }

    private function firstEligible(array $stops, array $visited): array
    {
        foreach ($stops as $s) {
            if (!isset($visited[$s['id']]) && $s['type'] === 'pickup') return $s;
        }
        return $stops[0];
    }

    // ── Distance helpers ─────────────────────────────────────────────────────

    private function nearest(array $current, array $candidates): array
    {
        $best = null;
        $min  = PHP_FLOAT_MAX;
        foreach ($candidates as $c) {
            $d = $this->haversine($current['lat'], $current['lng'], $c['lat'], $c['lng']);
            if ($d < $min) { $min = $d; $best = $c; }
        }
        return $best;
    }

    private function totalDistance(array $route, array $map): float
    {
        $total = 0.0;
        for ($i = 0; $i < count($route) - 1; $i++) {
            $a     = $map[$route[$i]];
            $b     = $map[$route[$i + 1]];
            $total += $this->haversine($a['lat'], $a['lng'], $b['lat'], $b['lng']);
        }
        return $total;
    }

    /** Haversine distance in miles. */
    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 3958.8;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat / 2) ** 2
              + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    private function indexById(array $stops): array
    {
        $map = [];
        foreach ($stops as $s) $map[$s['id']] = $s;
        return $map;
    }
}
