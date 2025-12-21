import {describe, it, expect} from '@jest/globals';
import {
  optionalNullable,
  createNameSchema,
  createPhoneSchema,
  createDateSchema,
  validateAgainstPatterns,
  baseSchemas,
} from '@sykamore/types';
import {z} from 'zod';

describe('Validation Helpers', () => {
  describe('optionalNullable', () => {
    it('makes schema optional and nullable', () => {
      const stringSchema = optionalNullable(
        z.string().min(1, 'Test field is required'),
      );

      expect(stringSchema.safeParse(undefined).success).toBe(true);
      expect(stringSchema.safeParse(null).success).toBe(true);
      expect(stringSchema.safeParse('valid value').success).toBe(true);
      expect(stringSchema.safeParse('').success).toBe(false);
      expect(stringSchema.safeParse(123).success).toBe(false);
    });

    it('provides correct error messages', () => {
      const stringSchema = optionalNullable(
        z.string().min(1, 'Test field is required'),
      );
      const result = stringSchema.safeParse('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Test field is required');
      }
    });

    describe('createNameSchema', () => {
      it('validates and transforms names correctly', () => {
        const nameSchema = createNameSchema();

        const result1 = nameSchema.safeParse('john doe');
        expect(result1.success).toBe(true);
        if (result1.success) {
          expect(result1.data).toBe('John Doe');
        }

        const result2 = nameSchema.safeParse('  jane  smith  ');
        expect(result2.success).toBe(true);
        if (result2.success) {
          expect(result2.data).toBe('Jane  Smith');
        }

        const result3 = nameSchema.safeParse('');
        expect(result3.success).toBe(false);

        const longName = 'A'.repeat(101);
        const result4 = nameSchema.safeParse(longName);
        expect(result4.success).toBe(false);
      });

      it('handles special characters in names', () => {
        const nameSchema = createNameSchema();

        expect(nameSchema.safeParse("Mary-Jane O'Connor").success).toBe(true);
        expect(nameSchema.safeParse('Jean-Luc Picard').success).toBe(true);
        expect(nameSchema.safeParse('Ana María García').success).toBe(true);
        expect(nameSchema.safeParse('123').success).toBe(false);
      });

      it('accepts custom field name and max length', () => {
        const firstNameSchema = createNameSchema('First name', 30);

        const result = firstNameSchema.safeParse('');
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('First name');
        }

        const longFirstName = 'A'.repeat(31);
        const result2 = firstNameSchema.safeParse(longFirstName);
        expect(result2.success).toBe(false);
      });
    });

    describe('createPhoneSchema', () => {
      it('validates and transforms phone numbers correctly', () => {
        const phoneSchema = createPhoneSchema();

        const testCases = [
          {input: '+1234567890', expected: '+1234567890'},
          {input: '(123) 456-7890', expected: '+1234567890'},
          {input: '123-456-7890', expected: '+1234567890'},
          {input: '123.456.7890', expected: '+1234567890'},
          {input: '1234567890', expected: '+1234567890'},
        ];

        testCases.forEach(({input, expected}) => {
          const result = phoneSchema.safeParse(input);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toBe(expected);
          }
        });
      });

      it('handles various phone number formats', () => {
        const phoneSchema = createPhoneSchema();

        const validNumbers = [
          '+1234567890',
          '(123) 456-7890',
          '123-456-7890',
          '1234567890',
        ];

        validNumbers.forEach((phone) => {
          const result = phoneSchema.safeParse(phone);
          expect(result.success).toBe(true);
        });

        expect(phoneSchema.safeParse('123').success).toBe(false);
        expect(phoneSchema.safeParse('abcde').success).toBe(false);

        const tooLongPhone = '1234567890123456';
        const result = phoneSchema.safeParse(tooLongPhone);
        expect(result.success).toBe(false);
      });

      it('properly removes non-digits and adds + prefix', () => {
        const phoneSchema = createPhoneSchema();

        const testCases = [
          {input: '(123) 456-7890', expected: '+1234567890'},
          {input: '123.456.7890', expected: '+1234567890'},
          {input: '+1-234-567-8901', expected: '+12345678901'},
        ];

        testCases.forEach(({input, expected}) => {
          const result = phoneSchema.safeParse(input);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toBe(expected);
          }
        });
      });
    });

    describe('createDateSchema', () => {
      it('validates dates correctly', () => {
        const dateSchema = createDateSchema();

        const validDates = ['2024-01-01', '2024-12-31', '2020-02-29'];

        validDates.forEach((date) => {
          const result = dateSchema.safeParse(date);
          expect(result.success).toBe(true);
        });

        const invalidDates = ['invalid-date', 'not-a-date-at-all'];

        invalidDates.forEach((date) => {
          const result = dateSchema.safeParse(date);
          expect(result.success).toBe(false);
        });

        const dateWithTime = '2024-01-15T12:30:45Z';
        const result = dateSchema.safeParse(dateWithTime);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('2024-01-15');
        }
      });
    });
  });

  describe('validateAgainstPatterns', () => {
    it('tests value against multiple patterns', () => {
      const patterns = [/^[a-z]+$/, /^[A-Z]+$/];

      expect(validateAgainstPatterns('hello', patterns)).toBe(true);
      expect(validateAgainstPatterns('HELLO', patterns)).toBe(true);
      expect(validateAgainstPatterns('Hello', patterns)).toBe(false);
      expect(validateAgainstPatterns('123', patterns)).toBe(false);
    });
  });

  describe('baseSchemas', () => {
    it('provides reusable string schemas', () => {
      const requiredString = baseSchemas.string.required();
      expect(requiredString.safeParse('valid').success).toBe(true);
      expect(requiredString.safeParse('').success).toBe(false);
      expect(requiredString.safeParse('short').success).toBe(true);
      expect(requiredString.safeParse('a'.repeat(101)).success).toBe(false);

      const optionalString = baseSchemas.string.optional();
      expect(optionalString.safeParse(undefined).success).toBe(true);
      expect(optionalString.safeParse('valid').success).toBe(true);
      expect(optionalString.safeParse('').success).toBe(false);

      const customString = baseSchemas.string.required(5, 10);
      expect(customString.safeParse('12345').success).toBe(true);
      expect(customString.safeParse('1234').success).toBe(false);
      expect(customString.safeParse('12345678901').success).toBe(false);
    });

    it('provides reusable number schemas', () => {
      const positiveNumber = baseSchemas.number.positive();
      expect(positiveNumber.safeParse(5).success).toBe(true);
      expect(positiveNumber.safeParse(0).success).toBe(false);
      expect(positiveNumber.safeParse(-1).success).toBe(false);

      const minNumber = baseSchemas.number.min(10);
      expect(minNumber.safeParse(15).success).toBe(true);
      expect(minNumber.safeParse(10).success).toBe(true);
      expect(minNumber.safeParse(9).success).toBe(false);

      const maxNumber = baseSchemas.number.max(100);
      expect(maxNumber.safeParse(50).success).toBe(true);
      expect(maxNumber.safeParse(100).success).toBe(true);
      expect(maxNumber.safeParse(101).success).toBe(false);
    });

    it('provides reusable boolean schemas', () => {
      const requiredBoolean = baseSchemas.boolean.required();
      expect(requiredBoolean.safeParse(true).success).toBe(true);
      expect(requiredBoolean.safeParse(false).success).toBe(true);
      expect(requiredBoolean.safeParse(undefined).success).toBe(false);

      const optionalBoolean = baseSchemas.boolean.optional();
      expect(optionalBoolean.safeParse(true).success).toBe(true);
      expect(optionalBoolean.safeParse(false).success).toBe(true);
      expect(optionalBoolean.safeParse(undefined).success).toBe(true);
    });
  });
});
