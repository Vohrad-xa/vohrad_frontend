import {
  userCredentialsSchema,
  adminCredentialsSchema,
  authTokensSchema,
  userSchema,
  refreshTokenRequestSchema,
} from '../schemas';

export function validateUserLogin(credentials: unknown) {
  return userCredentialsSchema.safeParse(credentials);
}

export function validateAdminLogin(credentials: unknown) {
  return adminCredentialsSchema.safeParse(credentials);
}

export function validateAuthTokens(tokens: unknown) {
  return authTokensSchema.safeParse(tokens);
}

export function validateUser(user: unknown) {
  return userSchema.safeParse(user);
}

export function validateRefreshTokenRequest(request: unknown) {
  return refreshTokenRequestSchema.safeParse(request);
}

export function getValidationErrorMessage(result: {
  success: boolean;
  error?: {issues: Array<{message?: string}>};
}): string {
  if (result.success) {
    return 'Invalid data';
  }
  return result.error?.issues[0]?.message || 'Invalid data';
}

export type {
  UserCredentials,
  AdminCredentials,
  AuthTokens,
  User,
  RefreshTokenRequest,
} from '../schemas';
