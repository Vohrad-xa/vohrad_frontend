import {z} from 'zod';
import {basePhoneSchema} from '../validation/helpers';

export const phoneNumberSchema = basePhoneSchema;

export const numericSchema = z
  .string()
  .min(1, 'Value is required')
  .transform((value) => value.trim().replace(',', '.'))
  .refine((value) => {
    const decimalPattern = /^[+-]?\d+(\.\d{0,2})?$/;
    return decimalPattern.test(value);
  }, 'Value must be a valid number')
  .transform(Number)
  .refine((num) => Number.isFinite(num), 'Value must be a valid number');

export const positiveNumberSchema = numericSchema.refine(
  (num) => num > 0,
  'Value must be positive',
);

export const nonNegativeNumberSchema = numericSchema.refine(
  (num) => num >= 0,
  'Value must be zero or positive',
);

export const integerSchema = numericSchema.refine(
  (num) => Number.isInteger(num),
  'Value must be a whole number',
);

export const decimalSchema = numericSchema.refine((num) => {
  const decimalPlaces = num.toString().split('.')[1]?.length || 0;
  return decimalPlaces <= 2;
}, 'Value cannot have more than 2 decimal places');

export const subdomainSchema = z
  .string()
  .min(1, 'Subdomain is required')
  .max(63, 'Subdomain cannot exceed 63 characters')
  .transform((value) => value.trim().toLowerCase())
  .refine(
    (value) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value),
    'Subdomain must contain only letters, numbers, and hyphens, and cannot start or end with a hyphen',
  );

export type PhoneNumber = z.infer<typeof phoneNumberSchema>;
export type NumericInput = z.infer<typeof numericSchema>;
export type PositiveNumber = z.infer<typeof positiveNumberSchema>;
export type NonNegativeNumber = z.infer<typeof nonNegativeNumberSchema>;
export type IntegerNumber = z.infer<typeof integerSchema>;
export type DecimalNumber = z.infer<typeof decimalSchema>;
export type Subdomain = z.infer<typeof subdomainSchema>;
