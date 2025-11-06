import type {ValidationResult} from './types';

export type NumericPrecision =
  | 'integer'
  | 'decimal'
  | {
      mode: 'decimal';
      maxFractionDigits?: number;
    };

export interface NumericValidationOptions {
  min?: number;
  max?: number;
  allowZero?: boolean;
  precision?: NumericPrecision;
  allowLeadingZero?: boolean;
  requireInteger?: boolean;
}

export function validateNumeric(
  rawValue: string,
  {
    min,
    max,
    allowZero = true,
    precision = 'decimal',
    allowLeadingZero = true,
    requireInteger,
  }: NumericValidationOptions = {},
): ValidationResult<number> {
  const trimmed = rawValue.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      state: 'empty',
      error: 'Value is required',
    };
  }

  const normalized = trimmed.replace(',', '.');

  if (!allowLeadingZero && /^0\d/.test(normalized)) {
    return {
      isValid: false,
      state: 'invalid',
      error: 'Leading zeros are not allowed',
    };
  }

  const shouldRequireInteger = requireInteger ?? precision === 'integer';
  const maxFractionDigits =
    typeof precision === 'object' ? (precision.maxFractionDigits ?? 2) : 2;

  const decimalPattern = shouldRequireInteger
    ? /^[+-]?\d+$/
    : new RegExp(`^[+-]?\\d+(\\.\\d{0,${maxFractionDigits}})?$`);

  if (!decimalPattern.test(normalized)) {
    return {
      isValid: false,
      state: 'invalid',
      error: shouldRequireInteger
        ? 'Value must be an integer'
        : maxFractionDigits > 0
          ? `Value must be a number with up to ${maxFractionDigits} decimals`
          : 'Value must be a number',
    };
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return {
      isValid: false,
      state: 'invalid',
      error: 'Value must be a valid number',
    };
  }

  if (!allowZero && parsed === 0) {
    return {
      isValid: false,
      state: 'invalid',
      error: 'Zero is not allowed',
    };
  }

  if (typeof min === 'number' && parsed < min) {
    return {
      isValid: false,
      state: 'invalid',
      error: `Value must be at least ${min}`,
    };
  }

  if (typeof max === 'number' && parsed > max) {
    return {
      isValid: false,
      state: 'invalid',
      error: `Value cannot exceed ${max}`,
    };
  }

  return {
    isValid: true,
    state: 'valid',
    error: null,
    value: parsed,
  };
}
