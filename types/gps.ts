export interface GpsCoordinates {
  lat: number;
  lng: number;
}

// Matches ShipmentPingReceived::broadcastWith() exactly
export interface GpsPingEvent {
  id:            number;
  shipment_id:   number;
  lat:           number;
  lng:           number;
  speed:         number | null;
  eta:           string | null;
  state_crossed: string | null;
  timestamp:     string;
}
