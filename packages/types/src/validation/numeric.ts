import {
  phoneNumberSchema,
  numericSchema,
  positiveNumberSchema,
  nonNegativeNumberSchema,
  integerSchema,
  decimalSchema,
} from '../schemas';

export function validatePhoneNumber(value: unknown) {
  return phoneNumberSchema.safeParse(value);
}

export function validateNumeric(value: unknown) {
  return numericSchema.safeParse(value);
}

export function validatePositiveNumber(value: unknown) {
  return positiveNumberSchema.safeParse(value);
}

export function validateNonNegativeNumber(value: unknown) {
  return nonNegativeNumberSchema.safeParse(value);
}

export function validateInteger(value: unknown) {
  return integerSchema.safeParse(value);
}

export function validateDecimal(value: unknown) {
  return decimalSchema.safeParse(value);
}

export type {
  PhoneNumber,
  NumericInput,
  PositiveNumber,
  NonNegativeNumber,
  IntegerNumber,
  DecimalNumber,
} from '../schemas';
