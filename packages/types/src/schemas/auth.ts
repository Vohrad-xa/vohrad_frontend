import {z} from 'zod';

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_expires_in: z.number().optional(),
});

export const authTokensSchema = tokenResponseSchema.extend({
  issued_at: z.number().optional(),
  refresh_flow: z.enum(['oidc_direct', 'social_exchange']).optional(),
});

export const identitySchema = z.object({
  id: z.uuid(),
  email: z.email(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  email_verified_at: z.string().nullish(),
  user_type: z.enum(['user', 'admin']),
  is_super_admin: z.boolean(),
});

export const tenantMembershipSchema = z.object({
  tenant_id: z.uuid(),
  name: z.string(),
  role: z.string(),
  is_default: z.boolean(),
});

export const oidcStartActionSchema = z.enum([
  'login',
  'passkey_register',
  'update_email',
]);

export const startWebLoginOptionsSchema = z.object({
  action: oidcStartActionSchema.optional(),
});

export const mobileOidcLoginParamsSchema = z.object({
  code: z.string().min(1),
  codeVerifier: z.string().min(1),
  redirectUri: z.string().min(1),
  tokenEndpoint: z.string().url().optional(),
});

export const authStateDataSchema = z.object({
  user: identitySchema.nullable(),
  tokens: authTokensSchema.nullable(),
  isAuthenticated: z.boolean(),
  intendedRoute: z.string().nullable(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
});

export const authContextDataSchema = z.object({
  isAuthenticated: z.boolean(),
  user: identitySchema.nullable(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
  authReady: z.boolean(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type Identity = z.infer<typeof identitySchema>;
export type OidcStartAction = z.infer<typeof oidcStartActionSchema>;
export type StartWebLoginOptions = z.infer<typeof startWebLoginOptionsSchema>;
export type MobileOidcLoginParams = z.infer<typeof mobileOidcLoginParamsSchema>;
export type AuthStateData = z.infer<typeof authStateDataSchema>;
export type AuthContextData = z.infer<typeof authContextDataSchema>;
