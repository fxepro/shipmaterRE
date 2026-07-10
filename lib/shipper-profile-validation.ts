/** Customer-facing shipper profile validation (matches Resources Manual matrix). */

export type ProfileTabId =
  | 'profile'
  | 'business'
  | 'services'
  | 'compliance'
  | 'payment'
  | 'subscription'
  | 'notifications'
  | 'team';

export interface ValidationIssue {
  id: string;
  tab: ProfileTabId;
  field: string;
  message: string;
  /** Blocks save when true */
  blocking: boolean;
}

export interface ProfileValidationInput {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone: string;
  company: string;
  taxId: string;
  taxIdType?: string;
}

function blank(v: string | undefined | null) {
  return !String(v ?? '').trim();
}

function looksLikeEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/** US EIN: 9 digits, optional XX-XXXXXXX formatting. */
export function looksLikeEin(v: string) {
  const digits = v.replace(/\D/g, '');
  return digits.length === 9;
}

/**
 * Banner issues only: missing required fields or bad format.
 * Verification steps (email link, SMS, W-9, submit) are NOT listed here —
 * those toast when the user clicks the verification action.
 */
export function collectFieldIssues(p: ProfileValidationInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const first = (p.firstName ?? p.name?.trim().split(/\s+/)[0] ?? '').trim();
  const lastParts = p.name?.trim().split(/\s+/) ?? [];
  const last = (p.lastName ?? (lastParts.length > 1 ? lastParts[lastParts.length - 1] : '')).trim();

  if (blank(first)) {
    issues.push({
      id: 'first_name',
      tab: 'profile',
      field: 'First name',
      message: 'First name is required on the Profile tab.',
      blocking: true,
    });
  }
  if (blank(last)) {
    issues.push({
      id: 'last_name',
      tab: 'profile',
      field: 'Last name',
      message: 'Last name is required on the Profile tab.',
      blocking: true,
    });
  }
  if (blank(p.email)) {
    issues.push({
      id: 'email',
      tab: 'profile',
      field: 'Email',
      message: 'Email is required on the Profile tab.',
      blocking: true,
    });
  } else if (!looksLikeEmail(p.email)) {
    issues.push({
      id: 'email_format',
      tab: 'profile',
      field: 'Email',
      message: 'Enter a valid email address on the Profile tab.',
      blocking: true,
    });
  }
  if (blank(p.phone)) {
    issues.push({
      id: 'phone',
      tab: 'profile',
      field: 'Phone',
      message: 'Phone number is required on the Profile tab.',
      blocking: true,
    });
  }

  if (blank(p.company)) {
    issues.push({
      id: 'company',
      tab: 'business',
      field: 'Legal business name',
      message: 'Legal business name is required on the Business tab.',
      blocking: true,
    });
  }
  if (blank(p.taxId)) {
    issues.push({
      id: 'tax_id',
      tab: 'business',
      field: 'Tax ID',
      message: 'Tax ID is required on the Business tab.',
      blocking: true,
    });
  } else if ((p.taxIdType || 'EIN').toUpperCase() === 'EIN' && !looksLikeEin(p.taxId)) {
    issues.push({
      id: 'ein_format',
      tab: 'business',
      field: 'Tax ID',
      message: 'EIN must be 9 digits (for example 12-3456789) on the Business tab.',
      blocking: true,
    });
  }

  return issues;
}

/** @deprecated Use collectFieldIssues for the page banner. */
export function collectShipperProfileIssues(p: ProfileValidationInput): ValidationIssue[] {
  return collectFieldIssues(p);
}

export function validateProfileTabForm(form: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}): string | null {
  if (blank(form.first_name)) return 'First name is required.';
  if (blank(form.last_name)) return 'Last name is required.';
  if (blank(form.email)) return 'Email is required.';
  if (!looksLikeEmail(form.email)) return 'Enter a valid email address.';
  if (blank(form.phone)) return 'Phone number is required.';
  return null;
}

export function validateBusinessTabForm(form: {
  company: string;
  tax_id: string;
  ein: string;
  tax_id_type?: string;
}): string | null {
  if (blank(form.company)) return 'Legal business name is required.';
  const tax = form.tax_id || form.ein;
  if (blank(tax)) return 'Tax ID is required.';
  if ((form.tax_id_type || 'EIN').toUpperCase() === 'EIN' && !looksLikeEin(tax)) {
    return 'EIN must be 9 digits (for example 12-3456789).';
  }
  return null;
}
