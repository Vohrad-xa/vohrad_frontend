import {describe, it, expect} from '@jest/globals';
import {schemas, validation} from '@sykamore/types';

describe('Auth Validation', () => {
  describe('Validation Functions', () => {
    it('validateUserLogin works correctly', () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123',
        tenant_id: 'tenant-123',
      };

      const result = validation.validateUserLogin(loginData);
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('user@example.com');
    });

    it('validateAdminLogin works correctly', () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const result = validation.validateAdminLogin(loginData);
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('admin@example.com');
    });

    it('validateAuthTokens works correctly', () => {
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

    it('getValidationErrorMessage works correctly', () => {
      const invalidResult = {
        success: false,
        error: {
          issues: [{message: 'Email is required'}],
        },
      } as any;

      const message = validation.getValidationErrorMessage(invalidResult);
      expect(message).toBe('Email is required');
    });

    it('getValidationErrorMessage returns default message', () => {
      const invalidResult = {
        success: false,
        error: {
          issues: [],
        },
      } as any;

      const message = validation.getValidationErrorMessage(invalidResult);
      expect(message).toBe('Invalid data');
    });

    it('getValidationErrorMessage handles success case', () => {
      const successResult = {
        success: true,
        data: {email: 'test@example.com'},
      } as any;

      const message = validation.getValidationErrorMessage(successResult);
      expect(message).toBe('Invalid data');
    });

    it('getValidationErrorMessage handles missing error', () => {
      const errorWithoutIssues = {
        success: false,
        error: {issues: []},
      } as any;

      const message = validation.getValidationErrorMessage(errorWithoutIssues);
      expect(message).toBe('Invalid data');
    });

    it('getValidationErrorMessage handles error without message', () => {
      const errorWithoutMessage = {
        success: false,
        error: {issues: [{}]},
      } as any;

      const message = validation.getValidationErrorMessage(errorWithoutMessage);
      expect(message).toBe('Invalid data');
    });

    it('getValidationErrorMessage handles undefined message', () => {
      const errorWithUndefinedMessage = {
        success: false,
        error: {issues: [{message: undefined}]},
      } as any;

      const message = validation.getValidationErrorMessage(
        errorWithUndefinedMessage,
      );
      expect(message).toBe('Invalid data');
    });

    it('getValidationErrorMessage handles null message', () => {
      const errorWithNullMessage = {
        success: false,
        error: {issues: [{message: null}]},
      } as any;

      const message =
        validation.getValidationErrorMessage(errorWithNullMessage);
      expect(message).toBe('Invalid data');
    });

    it('getValidationErrorMessage handles falsy message', () => {
      const errorWithFalsyMessage = {
        success: false,
        error: {issues: [{message: false}]},
      } as any;

      const message = validation.getValidationErrorMessage(
        errorWithFalsyMessage,
      );
      expect(message).toBe('Invalid data');
    });
  });

  describe('validateRefreshTokenRequest', () => {
    it('validates refresh token request correctly', () => {
      const refreshRequest = {
        refresh_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
      };

      const result = validation.validateRefreshTokenRequest(refreshRequest);
      expect(result.success).toBe(true);
      expect(result.data?.refresh_token).toBe(refreshRequest.refresh_token);
    });

    it('accepts empty refresh token', () => {
      const request = {
        refresh_token: '',
      };

      const result = validation.validateRefreshTokenRequest(request);
      expect(result.success).toBe(true);
    });

    it('accepts missing refresh token', () => {
      const request = {};

      const result = validation.validateRefreshTokenRequest(request);
      expect(result.success).toBe(true);
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

  describe('userCredentialsSchema', () => {
    it('validates correct user login data', () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123',
        tenant_id: 'tenant-123',
      };

      const result = schemas.userCredentialsSchema.safeParse(loginData);
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('user@example.com');
      expect(result.data?.tenant_id).toBe('tenant-123');
    });

    it('validates user login without tenant_id', () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123',
      };

      const result = schemas.userCredentialsSchema.safeParse(loginData);
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('user@example.com');
      expect(result.data?.tenant_id).toBeUndefined();
    });

    it('rejects invalid email format', () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = schemas.userCredentialsSchema.safeParse(loginData);
      expect(result.success).toBe(false);
    });

    it('rejects empty email', () => {
      const loginData = {
        email: '',
        password: 'password123',
      };

      const result = schemas.userCredentialsSchema.safeParse(loginData);
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const loginData = {
        email: 'user@example.com',
        password: '',
      };

      const result = schemas.userCredentialsSchema.safeParse(loginData);
      expect(result.success).toBe(false);
    });
  });

  describe('adminCredentialsSchema', () => {
    it('validates correct admin login data', () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const result = schemas.adminCredentialsSchema.safeParse(loginData);
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('admin@example.com');
    });

    it('rejects invalid admin email format', () => {
      const loginData = {
        email: 'admin@',
        password: 'admin123',
      };

      const result = schemas.adminCredentialsSchema.safeParse(loginData);
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
