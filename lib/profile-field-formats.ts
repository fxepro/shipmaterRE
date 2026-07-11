/**
 * Shared field-format helpers used by shipper + carrier profile validation.
 * Keep format rules here so Resources Manual matrices stay in sync with code.
 */

export function blank(v: string | undefined | null) {
  return !String(v ?? '').trim();
}

/**
 * Stricter than HTML5: requires domain + short alphabetic TLD (2–4 chars),
 * so values like alex@demo.comxxx are rejected.
 */
export function looksLikeEmail(v: string): boolean {
  const s = v.trim();
  if (s.length > 254) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/.test(s);
}

/** National number (no country code). Length 6–12 digits after stripping. */
export function looksLikeNationalPhone(v: string): boolean {
  const digits = v.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 12;
}

/** @deprecated Prefer looksLikeNationalPhone + separate country code. */
export function looksLikePhone(v: string): boolean {
  const trimmed = v.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }
  return looksLikeNationalPhone(trimmed);
}

/** US EIN: 9 digits, optional XX-XXXXXXX formatting. */
export function looksLikeEin(v: string) {
  const digits = v.replace(/\D/g, '');
  return digits.length === 9;
}

/** US ABA routing number: exactly 9 digits. */
export function looksLikeRoutingNumber(v: string) {
  return /^\d{9}$/.test(v.replace(/\D/g, ''));
}

/** Card PAN: 13–19 digits (Luhn not required client-side). */
export function looksLikeCardNumber(v: string) {
  const digits = v.replace(/\D/g, '');
  return digits.length >= 13 && digits.length <= 19;
}

/** MM/YY expiry. */
export function looksLikeCardExpiry(v: string) {
  return /^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(v.trim());
}

export function looksLikeCvv(v: string) {
  return /^\d{3,4}$/.test(v.replace(/\D/g, ''));
}

/** True when DOB is a real date and the person is at least 18. */
export function isAdultDob(v: string): boolean {
  if (blank(v)) return false;
  const dob = new Date(`${v.trim()}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age >= 18;
}
