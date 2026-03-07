import type {z} from 'zod';
import {emailSchema} from '../schemas';

const COMMON_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
};

export function suggestEmailCorrection(email: string): string | null {
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return null;

  const [local, domain] = parts;
  const correction = COMMON_TYPOS[domain];
  return correction ? `${local}@${correction}` : null;
}

export type EmailInput = z.infer<typeof emailSchema>;

export type EmailValidationResult = {
  isValid: boolean;
  state: 'empty' | 'invalid' | 'valid';
  error: string | null;
  value?: string;
  suggestion?: string;
};

export function validateEmail(value: string): EmailValidationResult {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return {isValid: false, state: 'empty', error: null};
  }

  const suggestion = suggestEmailCorrection(trimmed);
  if (suggestion) {
    return {
      isValid: false,
      state: 'invalid',
      error: null,
      suggestion,
    };
  }

  const result = emailSchema.safeParse(trimmed);

  if (!result.success) {
    const error = result.error.issues[0]?.message || 'Invalid email';
    return {
      isValid: false,
      state: 'invalid',
      error,
    };
  }

  return {
    isValid: true,
    state: 'valid',
    error: null,
    value: result.data,
  };
}

export function isEmail(value: string): boolean {
  return validateEmail(value).isValid;
}
