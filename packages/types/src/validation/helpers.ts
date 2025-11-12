import {z} from 'zod';

export const patterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: {
    INTERNATIONAL: /^\+\d{10,15}$/,
    US: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    DIGITS: /^\d{10,15}$/,
  },
  NAME: /^[a-zA-Z\s\-'\u00C0-\u017F]+$/,
  POSTAL_CODE: {
    US: /^\d{5}(-\d{4})?$/,
    CANADA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
  },
};

export const messages = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_DATE: 'Invalid date',
  TOO_SHORT: 'Too short',
  TOO_LONG: 'Too long',
};

export const commonRefinements = {
  email: (message?: string) => message || messages.INVALID_EMAIL,
  minLength: (min: number, field?: string) =>
    `${field || 'Field'} must be at least ${min} characters`,
  maxLength: (max: number, field?: string) =>
    `${field || 'Field'} cannot exceed ${max} characters`,
};

export const transformations = {
  trim: (value: string) => value.trim(),
  lowercase: (value: string) => value.toLowerCase(),
  uppercase: (value: string) => value.toUpperCase(),
  removeNonDigits: (value: string) => value.replace(/\D/g, ''),
  capitalizeWords: (value: string) =>
    value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()),
};

export const basePhoneSchema = z
  .string()
  .transform(transformations.removeNonDigits)
  .refine(
    (phone) => phone.length >= 10,
    'Phone number must be at least 10 digits',
  )
  .refine((phone) => phone.length <= 15, 'Phone number cannot exceed 15 digits')
  .transform((phone) => `+${phone}`);

export const baseDateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), messages.INVALID_DATE)
  .transform((date) => new Date(date).toISOString().split('T')[0]);

export function createNameSchema(field?: string, maxLength = 50) {
  return z
    .string()
    .min(1, commonRefinements.minLength(1, field))
    .max(maxLength, commonRefinements.maxLength(maxLength, field))
    .transform(transformations.trim)
    .transform(transformations.capitalizeWords)
    .refine((name) => patterns.NAME.test(name), {
      message: `${field || 'Name'} can only contain letters, spaces, hyphens, and apostrophes`,
    });
}

export function createPhoneSchema() {
  return basePhoneSchema;
}

export function createDateSchema() {
  return baseDateSchema;
}

export function createPostalCodeSchema() {
  const postalPatterns = Object.values(patterns.POSTAL_CODE);
  return z
    .string()
    .refine((postal) => {
      const normalized = postal.toUpperCase().replace(/\s/g, ' ');
      return postalPatterns.some((pattern) => pattern.test(normalized));
    }, 'Invalid postal code format')
    .transform((postal) => postal.toUpperCase().replace(/\s/g, ' '));
}

export function optionalNullable<T extends z.ZodType>(schema: T) {
  return schema.optional().nullable();
}

export function validateAgainstPatterns(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

export const baseSchemas = {
  string: {
    required: (min = 1, max = 100) => z.string().min(min).max(max),
    optional: (min = 1, max = 100) => z.string().min(min).max(max).optional(),
  },
  number: {
    positive: () => z.number().positive(),
    min: (min: number) => z.number().min(min),
    max: (max: number) => z.number().max(max),
  },
  boolean: {
    required: () => z.boolean(),
    optional: () => z.boolean().optional(),
  },
};
