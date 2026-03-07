import {
  phoneNumberSchema,
  numericSchema,
  positiveNumberSchema,
  nonNegativeNumberSchema,
  integerSchema,
  decimalSchema,
} from '../schemas';
import {createValidator} from './parse';

export const validatePhoneNumber = createValidator(phoneNumberSchema);
export const validateNumeric = createValidator(numericSchema);
export const validatePositiveNumber = createValidator(positiveNumberSchema);
export const validateNonNegativeNumber = createValidator(
  nonNegativeNumberSchema,
);
export const validateInteger = createValidator(integerSchema);
export const validateDecimal = createValidator(decimalSchema);
