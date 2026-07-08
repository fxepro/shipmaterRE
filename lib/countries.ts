export interface Country {
  code: string;   // ISO 3166-1 alpha-2
  name: string;
  dialCode: string;
  flag: string;   // emoji flag
  hasStates: boolean;
  stateLabel: string;   // "State", "Province", "Region", "County", etc.
  postalLabel: string;  // "ZIP Code", "Postal Code", "Postcode", etc.
  postalPattern?: RegExp;
  taxIdLabel?: string;  // EIN, BN, VAT, ABN, etc.
}

export const COUNTRIES: Country[] = [
  // ── North America ─────────────────────────────────────────────────
  { code: 'US', name: 'United States',   dialCode: '+1',    flag: '🇺🇸', hasStates: true,  stateLabel: 'State',    postalLabel: 'ZIP Code',     postalPattern: /^\d{5}(-\d{4})?$/, taxIdLabel: 'EIN' },
  { code: 'CA', name: 'Canada',          dialCode: '+1',    flag: '🇨🇦', hasStates: true,  stateLabel: 'Province', postalLabel: 'Postal Code',  postalPattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, taxIdLabel: 'BN' },
  { code: 'MX', name: 'Mexico',          dialCode: '+52',   flag: '🇲🇽', hasStates: true,  stateLabel: 'State',    postalLabel: 'Código Postal', taxIdLabel: 'RFC' },

  // ── Europe ────────────────────────────────────────────────────────
  { code: 'GB', name: 'United Kingdom',  dialCode: '+44',   flag: '🇬🇧', hasStates: false, stateLabel: 'County',   postalLabel: 'Postcode',     taxIdLabel: 'VAT' },
  { code: 'DE', name: 'Germany',         dialCode: '+49',   flag: '🇩🇪', hasStates: true,  stateLabel: 'State',    postalLabel: 'Postleitzahl', taxIdLabel: 'Steuernummer' },
  { code: 'FR', name: 'France',          dialCode: '+33',   flag: '🇫🇷', hasStates: false, stateLabel: 'Region',   postalLabel: 'Code Postal',  taxIdLabel: 'SIRET' },
  { code: 'NL', name: 'Netherlands',     dialCode: '+31',   flag: '🇳🇱', hasStates: false, stateLabel: 'Province', postalLabel: 'Postcode',     taxIdLabel: 'BTW' },
  { code: 'PL', name: 'Poland',          dialCode: '+48',   flag: '🇵🇱', hasStates: true,  stateLabel: 'Voivodeship', postalLabel: 'Kod pocztowy', taxIdLabel: 'NIP' },
  { code: 'ES', name: 'Spain',           dialCode: '+34',   flag: '🇪🇸', hasStates: true,  stateLabel: 'Province', postalLabel: 'Código Postal', taxIdLabel: 'CIF' },
  { code: 'IT', name: 'Italy',           dialCode: '+39',   flag: '🇮🇹', hasStates: true,  stateLabel: 'Province', postalLabel: 'CAP',          taxIdLabel: 'Partita IVA' },
  { code: 'SE', name: 'Sweden',          dialCode: '+46',   flag: '🇸🇪', hasStates: false, stateLabel: 'County',   postalLabel: 'Postnummer',   taxIdLabel: 'Organisationsnummer' },
  { code: 'NO', name: 'Norway',          dialCode: '+47',   flag: '🇳🇴', hasStates: false, stateLabel: 'County',   postalLabel: 'Postnummer',   taxIdLabel: 'Organisasjonsnummer' },
  { code: 'CH', name: 'Switzerland',     dialCode: '+41',   flag: '🇨🇭', hasStates: true,  stateLabel: 'Canton',   postalLabel: 'PLZ',          taxIdLabel: 'MwSt-Nr' },
  { code: 'AT', name: 'Austria',         dialCode: '+43',   flag: '🇦🇹', hasStates: true,  stateLabel: 'State',    postalLabel: 'PLZ',          taxIdLabel: 'UID' },
  { code: 'BE', name: 'Belgium',         dialCode: '+32',   flag: '🇧🇪', hasStates: false, stateLabel: 'Province', postalLabel: 'Postcode',     taxIdLabel: 'BTW' },
  { code: 'DK', name: 'Denmark',         dialCode: '+45',   flag: '🇩🇰', hasStates: false, stateLabel: 'Region',   postalLabel: 'Postnummer',   taxIdLabel: 'CVR' },
  { code: 'FI', name: 'Finland',         dialCode: '+358',  flag: '🇫🇮', hasStates: false, stateLabel: 'Region',   postalLabel: 'Postinumero',  taxIdLabel: 'Y-tunnus' },
  { code: 'PT', name: 'Portugal',        dialCode: '+351',  flag: '🇵🇹', hasStates: false, stateLabel: 'District', postalLabel: 'Código Postal', taxIdLabel: 'NIF' },
  { code: 'CZ', name: 'Czech Republic',  dialCode: '+420',  flag: '🇨🇿', hasStates: false, stateLabel: 'Region',   postalLabel: 'PSČ',          taxIdLabel: 'DIČ' },
  { code: 'RO', name: 'Romania',         dialCode: '+40',   flag: '🇷🇴', hasStates: true,  stateLabel: 'County',   postalLabel: 'Cod Poștal',   taxIdLabel: 'CUI' },
  { code: 'HU', name: 'Hungary',         dialCode: '+36',   flag: '🇭🇺', hasStates: false, stateLabel: 'County',   postalLabel: 'Irányítószám', taxIdLabel: 'Adószám' },
  { code: 'UA', name: 'Ukraine',         dialCode: '+380',  flag: '🇺🇦', hasStates: true,  stateLabel: 'Oblast',   postalLabel: 'Поштовий індекс', taxIdLabel: 'ЄДРПОУ' },
  { code: 'TR', name: 'Turkey',          dialCode: '+90',   flag: '🇹🇷', hasStates: true,  stateLabel: 'Province', postalLabel: 'Posta Kodu',   taxIdLabel: 'Vergi No' },

  // ── Asia-Pacific ──────────────────────────────────────────────────
  { code: 'AU', name: 'Australia',       dialCode: '+61',   flag: '🇦🇺', hasStates: true,  stateLabel: 'State/Territory', postalLabel: 'Postcode', taxIdLabel: 'ABN' },
  { code: 'NZ', name: 'New Zealand',     dialCode: '+64',   flag: '🇳🇿', hasStates: false, stateLabel: 'Region',   postalLabel: 'Postcode',     taxIdLabel: 'NZBN' },
  { code: 'IN', name: 'India',           dialCode: '+91',   flag: '🇮🇳', hasStates: true,  stateLabel: 'State',    postalLabel: 'PIN Code',     taxIdLabel: 'GSTIN' },
  { code: 'JP', name: 'Japan',           dialCode: '+81',   flag: '🇯🇵', hasStates: true,  stateLabel: 'Prefecture', postalLabel: '郵便番号',   taxIdLabel: '法人番号' },
  { code: 'CN', name: 'China',           dialCode: '+86',   flag: '🇨🇳', hasStates: true,  stateLabel: 'Province', postalLabel: 'Postal Code',  taxIdLabel: '统一社会信用代码' },
  { code: 'SG', name: 'Singapore',       dialCode: '+65',   flag: '🇸🇬', hasStates: false, stateLabel: 'District', postalLabel: 'Postal Code',  taxIdLabel: 'UEN' },
  { code: 'AE', name: 'UAE',             dialCode: '+971',  flag: '🇦🇪', hasStates: true,  stateLabel: 'Emirate',  postalLabel: 'P.O. Box',     taxIdLabel: 'TRN' },
  { code: 'SA', name: 'Saudi Arabia',    dialCode: '+966',  flag: '🇸🇦', hasStates: true,  stateLabel: 'Region',   postalLabel: 'Postal Code',  taxIdLabel: 'VAT' },
  { code: 'IL', name: 'Israel',          dialCode: '+972',  flag: '🇮🇱', hasStates: false, stateLabel: 'District', postalLabel: 'Postal Code',  taxIdLabel: 'ח.פ' },
  { code: 'KR', name: 'South Korea',     dialCode: '+82',   flag: '🇰🇷', hasStates: false, stateLabel: 'Province', postalLabel: '우편번호',    taxIdLabel: '사업자등록번호' },
  { code: 'ID', name: 'Indonesia',       dialCode: '+62',   flag: '🇮🇩', hasStates: true,  stateLabel: 'Province', postalLabel: 'Kode Pos',     taxIdLabel: 'NPWP' },
  { code: 'PH', name: 'Philippines',     dialCode: '+63',   flag: '🇵🇭', hasStates: false, stateLabel: 'Province', postalLabel: 'Postal Code',  taxIdLabel: 'TIN' },
  { code: 'MY', name: 'Malaysia',        dialCode: '+60',   flag: '🇲🇾', hasStates: true,  stateLabel: 'State',    postalLabel: 'Postcode',     taxIdLabel: 'SST No' },
  { code: 'TH', name: 'Thailand',        dialCode: '+66',   flag: '🇹🇭', hasStates: false, stateLabel: 'Province', postalLabel: 'Postal Code',  taxIdLabel: 'เลขประจำตัวผู้เสียภาษี' },
  { code: 'VN', name: 'Vietnam',         dialCode: '+84',   flag: '🇻🇳', hasStates: true,  stateLabel: 'Province', postalLabel: 'Mã bưu điện', taxIdLabel: 'Mã số thuế' },
  { code: 'PK', name: 'Pakistan',        dialCode: '+92',   flag: '🇵🇰', hasStates: true,  stateLabel: 'Province', postalLabel: 'Postal Code',  taxIdLabel: 'NTN' },
  { code: 'BD', name: 'Bangladesh',      dialCode: '+880',  flag: '🇧🇩', hasStates: false, stateLabel: 'Division', postalLabel: 'Postal Code',  taxIdLabel: 'BIN' },

  // ── Latin America ─────────────────────────────────────────────────
  { code: 'BR', name: 'Brazil',          dialCode: '+55',   flag: '🇧🇷', hasStates: true,  stateLabel: 'State',    postalLabel: 'CEP',          taxIdLabel: 'CNPJ' },
  { code: 'AR', name: 'Argentina',       dialCode: '+54',   flag: '🇦🇷', hasStates: true,  stateLabel: 'Province', postalLabel: 'Código Postal', taxIdLabel: 'CUIT' },
  { code: 'CL', name: 'Chile',           dialCode: '+56',   flag: '🇨🇱', hasStates: true,  stateLabel: 'Region',   postalLabel: 'Código Postal', taxIdLabel: 'RUT' },
  { code: 'CO', name: 'Colombia',        dialCode: '+57',   flag: '🇨🇴', hasStates: true,  stateLabel: 'Department', postalLabel: 'Código Postal', taxIdLabel: 'NIT' },
  { code: 'PE', name: 'Peru',            dialCode: '+51',   flag: '🇵🇪', hasStates: true,  stateLabel: 'Region',   postalLabel: 'Código Postal', taxIdLabel: 'RUC' },
  { code: 'VE', name: 'Venezuela',       dialCode: '+58',   flag: '🇻🇪', hasStates: true,  stateLabel: 'State',    postalLabel: 'Código Postal', taxIdLabel: 'RIF' },
  { code: 'GT', name: 'Guatemala',       dialCode: '+502',  flag: '🇬🇹', hasStates: true,  stateLabel: 'Department', postalLabel: 'Código Postal', taxIdLabel: 'NIT' },

  // ── Africa ────────────────────────────────────────────────────────
  { code: 'ZA', name: 'South Africa',    dialCode: '+27',   flag: '🇿🇦', hasStates: true,  stateLabel: 'Province', postalLabel: 'Postal Code',  taxIdLabel: 'VAT' },
  { code: 'NG', name: 'Nigeria',         dialCode: '+234',  flag: '🇳🇬', hasStates: true,  stateLabel: 'State',    postalLabel: 'Postal Code',  taxIdLabel: 'TIN' },
  { code: 'EG', name: 'Egypt',           dialCode: '+20',   flag: '🇪🇬', hasStates: true,  stateLabel: 'Governorate', postalLabel: 'Postal Code', taxIdLabel: 'Tax ID' },
  { code: 'KE', name: 'Kenya',           dialCode: '+254',  flag: '🇰🇪', hasStates: true,  stateLabel: 'County',   postalLabel: 'Postal Code',  taxIdLabel: 'KRA PIN' },
  { code: 'MA', name: 'Morocco',         dialCode: '+212',  flag: '🇲🇦', hasStates: false, stateLabel: 'Region',   postalLabel: 'Code Postal',  taxIdLabel: 'ICE' },
  { code: 'GH', name: 'Ghana',           dialCode: '+233',  flag: '🇬🇭', hasStates: false, stateLabel: 'Region',   postalLabel: 'Digital Address', taxIdLabel: 'TIN' },
  { code: 'ET', name: 'Ethiopia',        dialCode: '+251',  flag: '🇪🇹', hasStates: false, stateLabel: 'Region',   postalLabel: 'Postal Code',  taxIdLabel: 'TIN' },
];

export const COUNTRIES_MAP = Object.fromEntries(COUNTRIES.map(c => [c.code, c]));

export function getCountry(code: string): Country {
  return COUNTRIES_MAP[code] ?? COUNTRIES_MAP['US'];
}

export const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'], ['DC', 'District of Columbia'],
] as const;

export const CA_PROVINCES = [
  ['AB', 'Alberta'], ['BC', 'British Columbia'], ['MB', 'Manitoba'],
  ['NB', 'New Brunswick'], ['NL', 'Newfoundland and Labrador'], ['NS', 'Nova Scotia'],
  ['NT', 'Northwest Territories'], ['NU', 'Nunavut'], ['ON', 'Ontario'],
  ['PE', 'Prince Edward Island'], ['QC', 'Quebec'], ['SK', 'Saskatchewan'],
  ['YT', 'Yukon'],
] as const;

export const MX_STATES = [
  ['AGU', 'Aguascalientes'], ['BCN', 'Baja California'], ['BCS', 'Baja California Sur'],
  ['CAM', 'Campeche'], ['CHP', 'Chiapas'], ['CHH', 'Chihuahua'], ['COA', 'Coahuila'],
  ['COL', 'Colima'], ['DIF', 'Mexico City'], ['DUR', 'Durango'], ['GUA', 'Guanajuato'],
  ['GRO', 'Guerrero'], ['HID', 'Hidalgo'], ['JAL', 'Jalisco'], ['MEX', 'Mexico'],
  ['MIC', 'Michoacán'], ['MOR', 'Morelos'], ['NAY', 'Nayarit'], ['NLE', 'Nuevo León'],
  ['OAX', 'Oaxaca'], ['PUE', 'Puebla'], ['QUE', 'Querétaro'], ['ROO', 'Quintana Roo'],
  ['SLP', 'San Luis Potosí'], ['SIN', 'Sinaloa'], ['SON', 'Sonora'], ['TAB', 'Tabasco'],
  ['TAM', 'Tamaulipas'], ['TLA', 'Tlaxcala'], ['VER', 'Veracruz'], ['YUC', 'Yucatán'],
  ['ZAC', 'Zacatecas'],
] as const;

/** Returns subdivisions for countries that have them in a dropdown */
export function getSubdivisions(countryCode: string): [string, string][] | null {
  if (countryCode === 'US') return US_STATES as unknown as [string, string][];
  if (countryCode === 'CA') return CA_PROVINCES as unknown as [string, string][];
  if (countryCode === 'MX') return MX_STATES as unknown as [string, string][];
  return null; // free text for all others
}

/** Returns the national ID types available for a country */
export type NationalIdOption = { value: string; label: string };
export function getNationalIdTypes(countryCode: string): NationalIdOption[] {
  const base: NationalIdOption[] = [
    { value: 'passport', label: 'Passport' },
    { value: 'national_id', label: 'National Identity Card' },
    { value: 'drivers_licence', label: "Driver's Licence" },
    { value: 'residence_permit', label: 'Residence Permit' },
    { value: 'other', label: 'Other' },
  ];
  if (countryCode === 'US') {
    return [
      { value: 'ssn', label: 'Social Security Number (SSN)' },
      { value: 'itin', label: 'Individual Taxpayer ID (ITIN)' },
      { value: 'passport', label: 'Passport' },
      { value: 'drivers_licence', label: "Driver's Licence" },
    ];
  }
  if (countryCode === 'CA') {
    return [
      { value: 'sin', label: 'Social Insurance Number (SIN)' },
      { value: 'passport', label: 'Passport' },
      { value: 'drivers_licence', label: "Driver's Licence (Provincial)" },
      { value: 'national_id', label: 'Provincial ID Card' },
    ];
  }
  if (countryCode === 'MX') {
    return [
      { value: 'curp', label: 'CURP' },
      { value: 'rfc', label: 'RFC' },
      { value: 'passport', label: 'Passport' },
      { value: 'drivers_licence', label: "Driver's Licence" },
    ];
  }
  return base;
}
