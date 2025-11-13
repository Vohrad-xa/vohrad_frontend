import {describe, it, expect} from '@jest/globals';
import {validateUserUpdate, schemas} from '@vohrad/types';

describe('User Validation', () => {
  it('validates complete user data', () => {
    const userData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_number: '123-456-7890',
      date_of_birth: '1990-01-01',
      address: '123 Main St',
      city: 'New York',
      postal_code: '10001',
      country: 'US',
    };

    const result = validateUserUpdate(userData);
    expect(result.success).toBe(true);
  });

  it('transforms phone numbers correctly', () => {
    const userData = {
      phone_number: '(123) 456-7890',
    };

    const result = schemas.userUpdateDataSchema.safeParse(userData);
    expect(result.success).toBe(true);
    expect(result.data?.phone_number).toBe('+1234567890');
  });

  it('validates dates properly', () => {
    const userData = {
      date_of_birth: '1990-01-01',
    };

    const result = schemas.userUpdateDataSchema.safeParse(userData);
    expect(result.success).toBe(true);
    expect(result.data?.date_of_birth).toBe('1990-01-01');
  });

  it('handles partial updates', () => {
    const userData = {
      first_name: 'Jane',
    };

    const result = validateUserUpdate(userData);
    expect(result.success).toBe(true);
    expect(result.data?.first_name).toBe('Jane');
  });

  it('rejects invalid data', () => {
    const userData = {
      first_name: 'A'.repeat(100),
      email: 'invalid-email',
    };

    const result = validateUserUpdate(userData);
    expect(result.success).toBe(false);
  });

  it('handles nullable fields', () => {
    const userData = {
      first_name: null,
      phone_number: null,
    };

    const result = validateUserUpdate(userData);
    expect(result.success).toBe(true);
  });
});
