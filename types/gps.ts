export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export interface GpsPingEvent {
  shipment_id: number;
  lat: number;
  lng: number;
  eta?: string;
  state_crossed?: string;
  timestamp: string;
}
