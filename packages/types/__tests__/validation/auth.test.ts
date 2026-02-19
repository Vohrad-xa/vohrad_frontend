import {describe, it, expect} from '@jest/globals';
import {schemas, validation} from '@sykamore/types';

describe('Auth Validation', () => {
  describe('validateAuthTokens', () => {
    it('validates correct token response', () => {
      const tokens = {
        access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        refresh_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_expires_in: 7200,
      };

      const result = validation.validateAuthTokens(tokens);
      expect(result.success).toBe(true);
      expect(result.data?.access_token).toBe(tokens.access_token);
    });
  });

  describe('validateUser', () => {
    it('validates complete user object', () => {
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = validation.validateUser(user);
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('user@example.com');
    });

    it('rejects invalid user object', () => {
      const invalidUser = {
        email: 'invalid-email',
      };

      const result = validation.validateUser(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('authTokensSchema', () => {
    it('validates complete token response', () => {
      const tokens = {
        access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        refresh_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_expires_in: 7200,
        issued_at: Date.now(),
      };

      const result = schemas.authTokensSchema.safeParse(tokens);
      expect(result.success).toBe(true);
      expect(result.data?.access_token).toBe(tokens.access_token);
      expect(result.data?.refresh_token).toBe(tokens.refresh_token);
    });

    it('validates tokens without issued_at', () => {
      const tokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 1800,
        refresh_expires_in: 3600,
      };

      const result = schemas.authTokensSchema.safeParse(tokens);
      expect(result.success).toBe(true);
      expect(result.data?.issued_at).toBeUndefined();
    });

    it('rejects tokens with missing required fields', () => {
      const tokens = {
        access_token: 'access-token',
      };

      const result = schemas.authTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });
  });

  describe('userSchema', () => {
    it('validates complete user data', () => {
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'user',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+1234567890',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = schemas.userSchema.safeParse(user);
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('user-123');
      expect(result.data?.email).toBe('user@example.com');
    });

    it('validates user with nullable fields', () => {
      const user = {
        id: 'user-456',
        email: 'test@example.com',
        role: 'admin',
        first_name: null,
        last_name: null,
        phone_number: null,
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = schemas.userSchema.safeParse(user);
      expect(result.success).toBe(true);
      expect(result.data?.first_name).toBeNull();
      expect(result.data?.phone_number).toBeNull();
    });

    it('rejects user with missing required fields', () => {
      const user = {
        email: 'missing-fields@example.com',
      };

      const result = schemas.userSchema.safeParse(user);
      expect(result.success).toBe(false);
    });
  });
});
