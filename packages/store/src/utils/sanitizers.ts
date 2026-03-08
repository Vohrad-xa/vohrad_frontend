import type {Identity, AuthTokens} from '@sykamore/types';

export function sanitizeUser(user: Identity | null): Identity | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    email_verified_at: user.email_verified_at,
    user_type: user.user_type,
    is_super_admin: user.is_super_admin,
  };
}

export function redactTokens(
  tokens: AuthTokens | null,
): Omit<AuthTokens, 'access_token'> | null {
  if (!tokens) {
    return null;
  }

  const {
    access_token: _omitted,
    refresh_token,
    refresh_expires_in,
    expires_in,
    issued_at,
    refresh_flow,
    token_type,
  } = tokens;

  return {
    refresh_token,
    refresh_expires_in,
    expires_in,
    issued_at,
    refresh_flow,
    token_type,
  };
}
