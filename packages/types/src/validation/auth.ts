import {z} from 'zod';
import {
  authContextDataSchema,
  authStateDataSchema,
  authTokensSchema,
  identitySchema,
  mobileOidcLoginParamsSchema,
  oidcStartActionSchema,
  startWebLoginOptionsSchema,
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

export function validateOidcStartAction(action: unknown) {
  return oidcStartActionSchema.safeParse(action);
}

export function validateStartWebLoginOptions(options: unknown) {
  return startWebLoginOptionsSchema.safeParse(options);
}

export function validateMobileOidcLoginParams(params: unknown) {
  return mobileOidcLoginParamsSchema.safeParse(params);
}

export function validateAuthStateData(state: unknown) {
  return authStateDataSchema.safeParse(state);
}

export function validateAuthContextData(state: unknown) {
  return authContextDataSchema.safeParse(state);
}

export type {
  AuthTokens,
  TokenResponse,
  Identity,
  OidcStartAction,
  StartWebLoginOptions,
  MobileOidcLoginParams,
  AuthStateData,
  AuthContextData,
} from '../schemas';
