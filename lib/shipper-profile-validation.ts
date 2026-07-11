/** Customer-facing shipper profile validation (matches Resources Manual matrices). */

import {
  blank,
  looksLikeEmail,
  looksLikeNationalPhone,
  looksLikePhone,
  looksLikeEin,
  looksLikeRoutingNumber,
  looksLikeCardNumber,
  looksLikeCardExpiry,
  looksLikeCvv,
} from '@/lib/profile-field-formats';

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

export {
  looksLikeEmail,
  looksLikeNationalPhone,
  looksLikePhone,
  looksLikeEin,
  looksLikeRoutingNumber,
  looksLikeCardNumber,
  looksLikeCardExpiry,
  looksLikeCvv,
};

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
      message: 'Enter a valid email (for example you@company.com) on the Profile tab.',
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
  } else if (!looksLikeNationalPhone(p.phone) && !looksLikePhone(p.phone)) {
    issues.push({
      id: 'phone_format',
      tab: 'profile',
      field: 'Phone',
      message: 'Enter a valid phone number (local digits) on the Profile tab.',
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
  if (!looksLikeEmail(form.email)) return 'Enter a valid email (for example you@company.com).';
  if (blank(form.phone)) return 'Phone number is required.';
  if (!looksLikeNationalPhone(form.phone) && !looksLikePhone(form.phone)) {
    return 'Enter a valid phone number (local digits for your country code).';
  }
  return null;
}

export function profileTabFieldErrors(form: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}): Record<string, string> {
  const next: Record<string, string> = {};
  if (blank(form.first_name)) next.first_name = 'Required';
  if (blank(form.last_name)) next.last_name = 'Required';
  if (blank(form.email)) next.email = 'Required';
  else if (!looksLikeEmail(form.email)) next.email = 'Invalid email format';
  if (blank(form.phone)) next.phone = 'Required';
  else if (!looksLikeNationalPhone(form.phone) && !looksLikePhone(form.phone)) {
    next.phone = 'Invalid phone format';
  }
  return next;
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

export function validateTeamInvite(email: string, role: string): string | null {
  if (blank(email)) return 'Invite email is required.';
  if (!looksLikeEmail(email)) return 'Enter a valid invite email (for example name@company.com).';
  if (blank(role)) return 'Select a role for the invite.';
  return null;
}

export function validateAddCardForm(form: {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
}): string | null {
  if (blank(form.name)) return 'Cardholder name is required.';
  if (!looksLikeCardNumber(form.number)) return 'Enter a valid card number (13–19 digits).';
  if (!looksLikeCardExpiry(form.expiry)) return 'Enter expiry as MM/YY.';
  if (!looksLikeCvv(form.cvc)) return 'Enter a valid CVV (3–4 digits).';
  return null;
}

export function validateAddBankForm(form: {
  holder: string;
  routing: string;
  account: string;
  confirm: string;
}): string | null {
  if (blank(form.holder) || form.holder.trim().length < 2) return 'Account holder name is required.';
  if (!looksLikeRoutingNumber(form.routing)) return 'Routing number must be 9 digits.';
  if (form.account.replace(/\D/g, '').length < 4) return 'Account number must be at least 4 digits.';
  if (form.account !== form.confirm) return 'Account numbers do not match.';
  return null;
}
