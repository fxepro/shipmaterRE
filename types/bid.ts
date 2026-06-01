export interface Bid {
  id: number;
  shipment_id: number;
  carrier_id: number;
  carrier_name: string;
  carrier_rating: number;
  carrier_dot_verified: boolean;
  amount: number;
  estimated_pickup_date: string;
  estimated_delivery_date: string;
  note?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
}

export interface CarrierOffer {
  id: number;
  shipment_id: number;
  amount: number;
  estimated_pickup_date: string;
  estimated_delivery_date: string;
  note?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  item_description: string;
  route: string;
  shipment_status: string;
  shipper_name: string;
  created_at: string;
}
