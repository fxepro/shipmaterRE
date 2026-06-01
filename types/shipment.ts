import type { Bid } from './bid';

export type ShipmentStatus =
  | 'pending'
  | 'bidding'
  | 'offered'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'disputed'
  | 'cancelled';

export type JobType = 'open' | 'contracted';

export interface GpsPingData {
  lat: number;
  lng: number;
  speed?: number;
  eta?: string;
  pinged_at: string;
}

export interface Shipment {
  id: number;
  status: ShipmentStatus;
  job_type: JobType;
  contract_id?: number | null;
  tracking_token: string;

  // Item
  item_description: string;
  item_category?: string;
  weight_lbs?: number;
  handling_requirements?: string[];
  special_notes?: string;

  // Pickup
  pickup_address: string;
  pickup_city?: string;
  pickup_state?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  pickup_contact_name?: string;
  pickup_contact_phone?: string;
  pickup_date?: string;
  pickup_time_window?: string;

  // Delivery
  delivery_address: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  delivery_date?: string;
  delivery_time_window?: string;
  delivered_at?: string;
  delivery_photo_url?: string;

  // Route
  distance_miles?: number;
  estimated_duration_mins?: number;
  route_polyline?: string;

  // Cost
  agreed_cost?: number;

  // Parties
  shipper?: { id: number; name: string; email: string };
  carrier?: {
    id: number;
    name: string;
    email: string;
    carrier_profile?: {
      company_name?: string;
      dot_number?: string;
      dot_verified?: boolean;
      rating?: number;
      total_deliveries?: number;
    } | null;
  };
  receiver?: { id: number; name: string; email: string };

  // GPS
  latest_ping?: GpsPingData;

  // Bids (loaded when with_bids=1)
  bids?: Bid[];

  created_at: string;
  updated_at: string;
}
