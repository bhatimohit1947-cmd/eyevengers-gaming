import bcrypt from 'bcryptjs';

export function normalizeMobile(input: string): string {
  // Strip whitespace, dashes, brackets
  const cleaned = input.replace(/[\s\-()]/g, '');
  
  if (cleaned.startsWith('+91')) {
    return cleaned;
  }
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+91${cleaned.substring(1)}`;
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  // Return with leading plus if present or default
  return cleaned.startsWith('+') ? cleaned : `+91${cleaned}`;
}

export function isValidIndianMobile(mobile: string): boolean {
  const normalized = normalizeMobile(mobile);
  // Match +91 followed by 10 digits starting with 6, 7, 8, or 9
  return /^\+91[6-9]\d{9}$/.test(normalized);
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
