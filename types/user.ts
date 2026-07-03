export type UserRole   = 'shipper' | 'carrier' | 'receiver' | 'admin';
export type OrgType    = 'carrier' | 'shipper';
export type OrgRole    = 'owner' | 'admin' | 'dispatcher' | 'driver' | 'viewer';
export type OrgPlan    = 'free' | 'pro' | 'enterprise';
export type OrgStatus  = 'active' | 'suspended' | 'onboarding';
export type StripeMode = 'platform' | 'connect';

export interface Org {
  id: number;
  name: string;
  slug: string;
  type: OrgType;
  status: OrgStatus;
  plan: OrgPlan;
  logo_url?: string;
  is_platform_tenant?: boolean;
}

/** Admin-only view of an org (includes Stripe settings). */
export interface OrgAdmin extends Org {
  stripe_mode: StripeMode;
  stripe_connect_id: string | null;
  commission_rate: number | null;
  effective_rate: number;
  fmcsa_broker_mc: string | null;
  owner: { id: number; name: string; email: string } | null;
  created_at: string;
}

export interface PlatformTenant {
  id: number;
  org_id: number;
  org_name: string | null;
  lead_id: number | null;
  lead_company: string | null;
  subdomain: string | null;
  custom_domain: string | null;
  app_url: string;
  brand_name: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url_dark: string | null;
  favicon_url: string | null;
  hide_powered_by: boolean;
  fmcsa_broker_mc: string | null;
  feature_flags: Record<string, boolean> | null;
  stripe_subscription_id: string | null;
  status: 'pending' | 'active' | 'suspended';
  notes: string | null;
  created_at: string;
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
