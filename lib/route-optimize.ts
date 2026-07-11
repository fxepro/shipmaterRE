/**
 * Client port of api/app/Services/RouteOptimizationService.php
 * nearest-neighbour + 2-opt — same logic Create Job → Route uses.
 */

export type OptimStopType = 'pickup' | 'dropoff';

export interface OptimStop {
  id: string | number;
  lat: number;
  lng: number;
  type?: OptimStopType;
  required_pickups?: Array<string | number>;
}

export interface OptimResult {
  sequence: Array<string | number>;
  distance_miles: number;
  duration_minutes: number;
}

type StopMap = Record<string, OptimStop>;

function key(id: string | number) {
  return String(id);
}

function indexById(stops: OptimStop[]): StopMap {
  const map: StopMap = {};
  for (const s of stops) map[key(s.id)] = s;
  return map;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function totalDistance(route: Array<string | number>, map: StopMap): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const a = map[key(route[i])];
    const b = map[key(route[i + 1])];
    total += haversine(a.lat, a.lng, b.lat, b.lng);
  }
  return total;
}

function eligible(stops: OptimStop[], visited: Record<string, boolean>): OptimStop[] {
  return stops.filter(s => {
    if (visited[key(s.id)]) return false;
    if ((s.type ?? 'pickup') === 'pickup') return true;
    for (const pid of s.required_pickups ?? []) {
      if (!visited[key(pid)]) return false;
    }
    return true;
  });
}

function firstEligible(stops: OptimStop[], visited: Record<string, boolean>): OptimStop {
  for (const s of stops) {
    if (!visited[key(s.id)] && (s.type ?? 'pickup') === 'pickup') return s;
  }
  return stops[0];
}

function nearest(current: OptimStop, candidates: OptimStop[]): OptimStop {
  let best = candidates[0];
  let min = Infinity;
  for (const c of candidates) {
    const d = haversine(current.lat, current.lng, c.lat, c.lng);
    if (d < min) {
      min = d;
      best = c;
    }
  }
  return best;
}

function nearestNeighbour(stops: OptimStop[]): Array<string | number> {
  const visited: Record<string, boolean> = {};
  const route: Array<string | number> = [];

  let current = firstEligible(stops, visited);
  visited[key(current.id)] = true;
  route.push(current.id);

  while (route.length < stops.length) {
    const next = eligible(stops, visited);
    if (!next.length) break;
    current = nearest(current, next);
    visited[key(current.id)] = true;
    route.push(current.id);
  }

  return route;
}

function isValid(route: Array<string | number>, map: StopMap): boolean {
  const visited: Record<string, boolean> = {};
  for (const id of route) {
    const stop = map[key(id)];
    if ((stop.type ?? 'pickup') === 'dropoff' && (stop.required_pickups?.length ?? 0) > 0) {
      for (const pid of stop.required_pickups!) {
        if (!visited[key(pid)]) return false;
      }
    }
    visited[key(id)] = true;
  }
  return true;
}

function swap2opt(route: Array<string | number>, i: number, j: number): Array<string | number> {
  return [
    ...route.slice(0, i),
    ...route.slice(i, j + 1).reverse(),
    ...route.slice(j + 1),
  ];
}

function twoOpt(stops: OptimStop[], route: Array<string | number>): Array<string | number> {
  const map = indexById(stops);
  let best = totalDistance(route, map);
  let improved = true;
  let current = route;

  while (improved) {
    improved = false;
    const n = current.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const candidate = swap2opt(current, i, j);
        if (!isValid(candidate, map)) continue;
        const d = totalDistance(candidate, map);
        if (d < best - 0.001) {
          current = candidate;
          best = d;
          improved = true;
        }
      }
    }
  }

  return current;
}

function clusterPickupsFirst(stops: OptimStop[]): Array<string | number> {
  const pickups = stops.filter(s => (s.type ?? 'pickup') === 'pickup');
  const dropoffs = stops.filter(s => s.type === 'dropoff');
  const pickupRoute = pickups.length ? nearestNeighbour(pickups) : [];
  const dropoffRoute = dropoffs.length ? nearestNeighbour(dropoffs) : [];
  return [...pickupRoute, ...dropoffRoute];
}

/** Optimize stop order. Default mode matches Create Job “Shortest Route”. */
export function optimizeRoute(
  stops: OptimStop[],
  mode: 'shortest_route' | 'cluster_pickups' = 'shortest_route',
): OptimResult {
  if (stops.length === 0) {
    return { sequence: [], distance_miles: 0, duration_minutes: 0 };
  }
  if (stops.length === 1) {
    return { sequence: [stops[0].id], distance_miles: 0, duration_minutes: 0 };
  }

  let route =
    mode === 'cluster_pickups' ? clusterPickupsFirst(stops) : nearestNeighbour(stops);
  route = twoOpt(stops, route);

  const distance = totalDistance(route, indexById(stops));
  return {
    sequence: route,
    distance_miles: Math.round(distance * 100) / 100,
    duration_minutes: Math.ceil((distance / 50) * 60),
  };
}

/** Reorder items by optimizeRoute sequence (ids must match). */
export function reorderBySequence<T extends { id: string | number }>(
  items: T[],
  sequence: Array<string | number>,
): T[] {
  const map = new Map(items.map(i => [key(i.id), i]));
  const ordered: T[] = [];
  for (const id of sequence) {
    const item = map.get(key(id));
    if (item) ordered.push(item);
  }
  // Append any missing (shouldn't happen)
  for (const item of items) {
    if (!ordered.includes(item)) ordered.push(item);
  }
  return ordered;
}
