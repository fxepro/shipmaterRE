export type UserRole = 'shipper' | 'carrier' | 'receiver' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface CarrierProfile {
  dot_number?: string;
  dot_verified: boolean;
  mc_number?: string;
  insurance_verified: boolean;
  background_check_status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  rating: number;
  total_deliveries: number;
}
