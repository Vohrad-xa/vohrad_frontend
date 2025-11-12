import {describe, it, expect} from '@jest/globals';
import {
  validateEmail,
  suggestEmailCorrection,
  isEmail,
  schemas,
} from '@vohrad/types';

describe('Email Validation', () => {
  describe('validateEmail', () => {
    it('validates correct emails', () => {
      const result = validateEmail('user@gmail.com');
      expect(result.isValid).toBe(true);
      expect(result.state).toBe('valid');
      expect(result.value).toBe('user@gmail.com');
    });

    it('handles empty emails', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('empty');
      expect(result.error).toBeNull();
    });

    it('provides suggestions for typos', () => {
      const result = validateEmail('user@gmial.com');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('invalid');
      expect(result.suggestion).toBe('user@gmail.com');
      expect(result.error).toBeNull();
    });

    it('validates email format correctly', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('invalid');
      expect(result.error).toBe('Invalid email format');
    });

    it('handles emails with leading/trailing spaces', () => {
      const result = validateEmail('  user@gmail.com  ');
      expect(result.isValid).toBe(true);
      expect(result.state).toBe('valid');
      expect(result.value).toBe('user@gmail.com');
    });

    it('validates complex valid emails', () => {
      const result = validateEmail('test.email+tag@example-domain.co.uk');
      expect(result.isValid).toBe(true);
      expect(result.state).toBe('valid');
    });

    it('handles empty string with whitespace', () => {
      const result = validateEmail('   ');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('empty');
      expect(result.error).toBeNull();
    });

    it('rejects malformed emails', () => {
      const invalidEmails = [
        'plainaddress',
        '@missing-local.com',
        'username@',
        'user@@gmail.com',
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.state).toBe('invalid');
      });
    });
  });

  describe('suggestEmailCorrection', () => {
    it('suggests corrections for common typos', () => {
      expect(suggestEmailCorrection('user@gmial.com')).toBe('user@gmail.com');
      expect(suggestEmailCorrection('user@hotmial.com')).toBe(
        'user@hotmail.com',
      );
      expect(suggestEmailCorrection('user@yahooo.com')).toBe('user@yahoo.com');
      expect(suggestEmailCorrection('user@outlok.com')).toBe(
        'user@outlook.com',
      );
    });

    it('returns null for valid emails', () => {
      expect(suggestEmailCorrection('user@gmail.com')).toBeNull();
      expect(suggestEmailCorrection('test@example.com')).toBeNull();
    });

    it('returns null for invalid format', () => {
      expect(suggestEmailCorrection('invalid-email')).toBeNull();
      expect(suggestEmailCorrection('no-at-sign')).toBeNull();
    });
  });

  describe('emailSchema', () => {
    it('transforms emails to lowercase', () => {
      const result = schemas.emailSchema.safeParse('User@GMAIL.COM');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('user@gmail.com');
      }
    });

    it('rejects emails with whitespace', () => {
      const result = schemas.emailSchema.safeParse('  user@gmail.com  ');
      expect(result.success).toBe(false);
    });

    it('rejects invalid formats', () => {
      expect(schemas.emailSchema.safeParse('invalid').success).toBe(false);
      expect(schemas.emailSchema.safeParse('@example.com').success).toBe(false);
      expect(schemas.emailSchema.safeParse('user@').success).toBe(false);
    });

    it('accepts valid emails', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'name+tag@example.org',
      ];

      validEmails.forEach((email) => {
        expect(schemas.emailSchema.safeParse(email).success).toBe(true);
      });
    });
  });

  describe('isEmail', () => {
    it('returns true for valid emails', () => {
      expect(isEmail('user@gmail.com')).toBe(true);
      expect(isEmail('test@example.org')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isEmail('invalid')).toBe(false);
      expect(isEmail('')).toBe(false);
      expect(isEmail('@example.com')).toBe(false);
    });
  });
});
