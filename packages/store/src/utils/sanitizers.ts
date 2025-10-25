import type {User, AuthTokens} from '@vohrad/types';

export function sanitizeUser(user: User | null): User | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    role_description: user.role_description,
    tenant_id: user.tenant_id,
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    date_of_birth: user.date_of_birth,
    address: user.address,
    city: user.city,
    province: user.province,
    postal_code: user.postal_code,
    country: user.country,
    email_verified_at: user.email_verified_at,
    pending_email: user.pending_email,
    pending_email_requested_at: user.pending_email_requested_at,
    pending_email_expires_at: user.pending_email_expires_at,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export function redactTokens(tokens: AuthTokens | null): AuthTokens | null {
  if (!tokens) {
    return null;
  }

  const {
    access_token,
    refresh_token,
    refresh_expires_in,
    expires_in,
    issued_at,
    token_type,
  } = tokens;

  return {
    access_token,
    refresh_token,
    refresh_expires_in,
    expires_in,
    issued_at,
    token_type,
  } as AuthTokens;
}
