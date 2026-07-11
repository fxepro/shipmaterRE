/** Session handoff from Route Planner → New Shipment / Create Job */
export const ROUTE_PLANNER_HANDOFF_KEY = 'shipmater.routePlannerHandoff';

export type PlannerStopRole = 'pickup' | 'delivery';

export interface PlannerHandoffStop {
  address: string;
  label: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  zip?: string;
  name?: string | null;
  locationId?: number | null;
  role: PlannerStopRole;
}

export interface PlannerHandoff {
  stops: PlannerHandoffStop[];
  /** Optimised visit order as indices into `stops` (entry order). */
  visitOrder?: number[];
  distanceM?: number;
  durationS?: number;
}

export function savePlannerHandoff(data: PlannerHandoff) {
  try {
    sessionStorage.setItem(ROUTE_PLANNER_HANDOFF_KEY, JSON.stringify(data));
  } catch { /* quota / private mode */ }
}

export function loadPlannerHandoff(): PlannerHandoff | null {
  try {
    const raw = sessionStorage.getItem(ROUTE_PLANNER_HANDOFF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(ROUTE_PLANNER_HANDOFF_KEY);
    const parsed = JSON.parse(raw) as PlannerHandoff;
    if (!parsed?.stops?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}
