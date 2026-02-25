import {z} from 'zod';
import {
  authTokensSchema,
  identitySchema,
  tenantMembershipSchema,
} from '../schemas';

export function validateAuthTokens(tokens: unknown) {
  return authTokensSchema.safeParse(tokens);
}

export function validateIdentity(identity: unknown) {
  return identitySchema.safeParse(identity);
}

export function validateTenantMemberships(memberships: unknown) {
  return z.array(tenantMembershipSchema).safeParse(memberships);
}

export type {AuthTokens, TokenResponse, Identity} from '../schemas';
