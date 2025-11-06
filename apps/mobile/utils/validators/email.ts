import type {ValidationResult, ValidationState} from './types';

// RFC 5322 compliant email regex with practical limitations
const EMAIL_REGEX =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

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

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'throwaway.email',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
]);

export type EmailValidationState = ValidationState;

export type EmailValidationResult = ValidationResult<string> & {
  suggestion?: string;
};

export function validateEmail(value: string): EmailValidationResult {
  const trimmed = value.trim().toLowerCase();

  if (trimmed.length === 0) {
    return {isValid: false, state: 'empty', error: null};
  }

  if (!trimmed.includes('@')) {
    return {isValid: false, state: 'invalid', error: 'Invalid email'};
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return {isValid: false, state: 'invalid', error: 'Invalid email'};
  }

  const [local, domain] = parts;

  if (!local || !domain) {
    return {isValid: false, state: 'invalid', error: 'Invalid email'};
  }

  const suggestion = COMMON_TYPOS[domain];
  if (suggestion) {
    return {
      isValid: false,
      state: 'invalid',
      error: null,
      suggestion: `${local}@${suggestion}`,
    };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {isValid: false, state: 'invalid', error: 'Invalid email'};
  }

  if (!domain.includes('.')) {
    return {isValid: false, state: 'invalid', error: 'Invalid email'};
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return {isValid: false, state: 'invalid', error: 'Invalid email'};
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return {isValid: false, state: 'invalid', error: 'Invalid email'};
  }

  return {isValid: true, state: 'valid', error: null, value: trimmed};
}

export function isEmail(value: string): boolean {
  return validateEmail(value).isValid;
}
