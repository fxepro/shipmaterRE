export type ProfileTab = 'personal' | 'dot_commercial' | 'insurance' | 'medical' | 'financial' | 'background';

interface RuleSet {
  required: string[];
  recommended: string[];
  tabs: ProfileTab[];
}

const RULES: Record<string, RuleSet> = {
  // Freight & Logistics
  general_freight:   { required: ['dot_number', 'mc_number', 'company_name', 'auto_policy_number', 'cargo_policy_number'], recommended: ['cdl_number'], tabs: ['dot_commercial', 'insurance'] },
  hotshot:           { required: ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['dot_commercial', 'insurance'] },
  refrigerated:      { required: ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['dot_commercial', 'insurance'] },
  flatbed:           { required: ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['dot_commercial', 'insurance'] },
  dry_van:           { required: ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['dot_commercial', 'insurance'] },
  hazmat:            { required: ['dot_number', 'mc_number', 'cdl_number', 'hazmat_endorsement', 'auto_policy_number', 'cargo_policy_number'], recommended: ['hazmat_expiry_date'], tabs: ['dot_commercial', 'insurance', 'medical'] },

  // Medical & Pharmaceutical
  medical_courier:         { required: ['auto_policy_number'], recommended: ['background_check_status'], tabs: ['personal', 'insurance'] },
  pharma_courier:          { required: ['auto_policy_number', 'cargo_policy_number'], recommended: ['background_check_status'], tabs: ['personal', 'insurance'] },
  hospital_courier:        { required: ['auto_policy_number'], recommended: ['cargo_policy_number', 'background_check_status'], tabs: ['personal', 'insurance'] },
  blood_platelets:         { required: ['auto_policy_number'], recommended: ['cargo_policy_number', 'background_check_status'], tabs: ['personal', 'insurance'] },
  temp_controlled_courier: { required: ['auto_policy_number', 'cargo_policy_number'], recommended: ['dot_number'], tabs: ['personal', 'insurance'] },
  life_science:            { required: ['auto_policy_number'], recommended: ['cargo_policy_number', 'background_check_status'], tabs: ['personal', 'insurance'] },

  // Auto & Vehicles
  auto_transport_open:     { required: ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['dot_commercial', 'insurance'] },
  auto_transport_enclosed: { required: ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['dot_commercial', 'insurance'] },
  auto_parts:              { required: ['auto_policy_number'], recommended: [], tabs: ['personal', 'insurance'] },
  motorcycle_transport:    { required: ['auto_policy_number'], recommended: ['cargo_policy_number'], tabs: ['personal', 'insurance'] },
  rv_boat_powersports:     { required: ['dot_number', 'auto_policy_number'], recommended: ['mc_number'], tabs: ['dot_commercial', 'insurance'] },

  // Art, Antiques & Specialty
  white_glove:       { required: ['auto_policy_number', 'cargo_policy_number'], recommended: ['background_check_status'], tabs: ['personal', 'insurance'] },
  fine_art:          { required: ['auto_policy_number', 'cargo_policy_number'], recommended: ['background_check_status'], tabs: ['personal', 'insurance'] },
  antiques_estate:   { required: ['auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['personal', 'insurance'] },
  fragile_highvalue: { required: ['auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['personal', 'insurance'] },

  // Food & Beverage
  restaurant_supply: { required: ['auto_policy_number'], recommended: ['cargo_policy_number'], tabs: ['personal', 'insurance'] },
  grocery_retail:    { required: ['auto_policy_number'], recommended: ['cargo_policy_number'], tabs: ['personal', 'insurance'] },
  cold_chain_food:   { required: ['dot_number', 'auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['dot_commercial', 'insurance'] },
  alcohol_spirits:   { required: ['auto_policy_number'], recommended: ['cargo_policy_number'], tabs: ['personal', 'insurance'] },

  // Construction & Equipment
  heavy_equipment:        { required: ['dot_number', 'mc_number', 'cdl_number', 'cdl_class', 'auto_policy_number', 'cargo_policy_number'], recommended: ['dot_medical_expiry'], tabs: ['dot_commercial', 'insurance', 'medical'] },
  construction_materials: { required: ['dot_number', 'auto_policy_number'], recommended: ['mc_number'], tabs: ['dot_commercial', 'insurance'] },
  oversized_load:         { required: ['dot_number', 'mc_number', 'cdl_number', 'auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['dot_commercial', 'insurance', 'medical'] },
  crane_rigging:          { required: ['dot_number', 'mc_number', 'auto_policy_number', 'cargo_policy_number'], recommended: [], tabs: ['dot_commercial', 'insurance'] },

  // Household
  moving_relocation:  { required: ['auto_policy_number', 'cargo_policy_number'], recommended: ['background_check_status'], tabs: ['personal', 'insurance'] },
  appliance_delivery: { required: ['auto_policy_number'], recommended: ['cargo_policy_number'], tabs: ['personal', 'insurance'] },
  furniture_delivery: { required: ['auto_policy_number'], recommended: ['cargo_policy_number'], tabs: ['personal', 'insurance'] },
  junk_removal:       { required: ['auto_policy_number'], recommended: [], tabs: ['personal', 'insurance'] },
  compost_pickup:     { required: ['auto_policy_number'], recommended: [], tabs: ['personal', 'insurance'] },

  // Local & Last Mile
  same_day_courier: { required: ['auto_policy_number'], recommended: ['background_check_status'], tabs: ['personal', 'insurance'] },
  last_mile:        { required: ['auto_policy_number'], recommended: ['background_check_status'], tabs: ['personal', 'insurance'] },
  parcel_delivery:  { required: ['auto_policy_number'], recommended: [], tabs: ['personal', 'insurance'] },
  b2b_local:        { required: ['auto_policy_number'], recommended: [], tabs: ['personal', 'insurance'] },
};

export function getRequiredFields(selectedKeys: string[]): string[] {
  const fields = new Set<string>();
  for (const key of selectedKeys) for (const f of RULES[key]?.required ?? []) fields.add(f);
  return [...fields];
}

export function getRecommendedFields(selectedKeys: string[]): string[] {
  const fields = new Set<string>();
  for (const key of selectedKeys) for (const f of RULES[key]?.recommended ?? []) fields.add(f);
  return [...fields];
}

export function getRelevantTabs(selectedKeys: string[]): ProfileTab[] {
  const tabs = new Set<ProfileTab>(['personal']);
  for (const key of selectedKeys) for (const t of RULES[key]?.tabs ?? []) tabs.add(t);
  if (selectedKeys.length > 0) { tabs.add('financial'); tabs.add('background'); }
  return [...tabs];
}

export function requiresDot(selectedKeys: string[]): boolean {
  return selectedKeys.some(k => RULES[k]?.required.includes('dot_number'));
}

export function isFieldRequired(field: string, selectedKeys: string[]): boolean {
  return getRequiredFields(selectedKeys).includes(field);
}
