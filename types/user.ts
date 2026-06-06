export type UserRole = 'shipper' | 'carrier' | 'receiver' | 'admin';
export type OrgType  = 'carrier' | 'shipper';
export type OrgRole  = 'owner' | 'admin' | 'dispatcher' | 'driver' | 'viewer';
export type OrgPlan  = 'free' | 'pro' | 'enterprise';
export type OrgStatus = 'active' | 'suspended' | 'onboarding';

export interface Org {
  id: number;
  name: string;
  slug: string;
  type: OrgType;
  status: OrgStatus;
  plan: OrgPlan;
  logo_url?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;

  // Multi-org
  org?: Org;
  org_role?: OrgRole;
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

// Helpers
export function isCarrier(user: User): boolean {
  return user.org?.type === 'carrier' || user.role === 'carrier';
}

export function isShipper(user: User): boolean {
  return user.org?.type === 'shipper' || user.role === 'shipper';
}

export function canDispatch(user: User): boolean {
  return ['owner', 'admin', 'dispatcher'].includes(user.org_role ?? '');
}

export function canManageTeam(user: User): boolean {
  return ['owner', 'admin'].includes(user.org_role ?? '');
}
