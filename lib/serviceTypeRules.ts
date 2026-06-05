// ── Service Type Definitions ──────────────────────────────────────────────

export interface ServiceType {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'commercial' | 'medical' | 'specialized' | 'local';
  requires_dot: boolean;
  requires_mc: boolean;
  requires_cdl: boolean;
  requires_hazmat: boolean;
}

export interface ServiceTypeRules {
  required: string[];
  recommended: string[];
  tabs: ProfileTab[];
}

export type ProfileTab = 'personal' | 'dot_commercial' | 'insurance' | 'medical' | 'financial' | 'background';

// ── Rules per service type ────────────────────────────────────────────────

const RULES: Record<string, ServiceTypeRules> = {
  freight: {
    required:    ['dot_number', 'mc_number', 'company_name', 'auto_policy_number', 'cargo_policy_number'],
    recommended: ['cdl_number', 'usdot_number', 'dot_medical_expiry'],
    tabs:        ['dot_commercial', 'insurance'],
  },
  hotshot: {
    required:    ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'],
    recommended: ['company_name', 'cdl_number'],
    tabs:        ['dot_commercial', 'insurance'],
  },
  auto_transport: {
    required:    ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'],
    recommended: ['company_name'],
    tabs:        ['dot_commercial', 'insurance'],
  },
  heavy_equipment: {
    required:    ['dot_number', 'mc_number', 'cdl_number', 'cdl_class', 'auto_policy_number', 'cargo_policy_number'],
    recommended: ['company_name', 'dot_medical_expiry'],
    tabs:        ['dot_commercial', 'insurance', 'medical'],
  },
  hazmat: {
    required:    ['dot_number', 'mc_number', 'cdl_number', 'hazmat_endorsement', 'auto_policy_number', 'cargo_policy_number'],
    recommended: ['hazmat_expiry_date', 'dot_medical_expiry'],
    tabs:        ['dot_commercial', 'insurance', 'medical'],
  },
  refrigerated: {
    required:    ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'],
    recommended: ['company_name'],
    tabs:        ['dot_commercial', 'insurance'],
  },
  medical_courier: {
    required:    ['auto_policy_number'],
    recommended: ['cargo_policy_number', 'background_check_status'],
    tabs:        ['personal', 'insurance'],
  },
  white_glove: {
    required:    ['auto_policy_number', 'cargo_policy_number'],
    recommended: ['background_check_status'],
    tabs:        ['personal', 'insurance'],
  },
  last_mile: {
    required:    ['auto_policy_number'],
    recommended: ['background_check_status'],
    tabs:        ['personal', 'insurance'],
  },
  moving: {
    required:    ['auto_policy_number', 'cargo_policy_number'],
    recommended: ['background_check_status'],
    tabs:        ['personal', 'insurance'],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

/** Fields that must be filled for the selected service types */
export function getRequiredFields(selectedKeys: string[]): string[] {
  const fields = new Set<string>();
  for (const key of selectedKeys) {
    for (const f of RULES[key]?.required ?? []) fields.add(f);
  }
  return [...fields];
}

/** Fields recommended (shown but not blocking) */
export function getRecommendedFields(selectedKeys: string[]): string[] {
  const fields = new Set<string>();
  for (const key of selectedKeys) {
    for (const f of RULES[key]?.recommended ?? []) fields.add(f);
  }
  return [...fields];
}

/** Profile tabs that are relevant to the selected service types */
export function getRelevantTabs(selectedKeys: string[]): ProfileTab[] {
  const tabs = new Set<ProfileTab>(['personal']); // always shown
  for (const key of selectedKeys) {
    for (const t of RULES[key]?.tabs ?? []) tabs.add(t);
  }
  // financial and background always shown if any type selected
  if (selectedKeys.length > 0) {
    tabs.add('financial');
    tabs.add('background');
  }
  return [...tabs];
}

/** True if any selected type requires DOT */
export function requiresDot(selectedKeys: string[]): boolean {
  return selectedKeys.some(k => RULES[k]?.required.includes('dot_number'));
}

/** True if a specific field is required given selected types */
export function isFieldRequired(field: string, selectedKeys: string[]): boolean {
  return getRequiredFields(selectedKeys).includes(field);
}

/** True if a specific field is relevant (required or recommended) */
export function isFieldRelevant(field: string, selectedKeys: string[]): boolean {
  return (
    getRequiredFields(selectedKeys).includes(field) ||
    getRecommendedFields(selectedKeys).includes(field)
  );
}

/** Category label map */
export const CATEGORY_LABELS: Record<string, string> = {
  commercial:  'Commercial',
  medical:     'Medical',
  specialized: 'Specialized',
  local:       'Local & Last Mile',
};
