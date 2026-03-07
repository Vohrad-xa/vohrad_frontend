import {z} from 'zod';

const nullishToUndefined = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  schema.nullish().transform((value) => value ?? undefined);

export const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: nullishToUndefined(z.string().min(1)),
  token_type: z.string().min(1),
  expires_in: z.coerce.number().int().positive(),
  refresh_expires_in: nullishToUndefined(
    z.coerce.number().int().nonnegative(),
  ),
});

export const authTokensSchema = tokenResponseSchema.extend({
  issued_at: z.coerce.number().int().nonnegative().optional(),
  refresh_flow: z.enum(['oidc_direct', 'social_exchange']).optional(),
});

export const identitySchema = z.strictObject({
  id: z.uuid(),
  email: z.email(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  email_verified_at: z.string().nullish(),
  user_type: z.enum(['user', 'admin']),
  is_super_admin: z.boolean(),
});

export const tenantMembershipSchema = z.strictObject({
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

export const startWebLoginOptionsSchema = z.strictObject({
  action: oidcStartActionSchema.optional(),
});

export const mobileOidcLoginParamsSchema = z.strictObject({
  code: z.string().min(1),
  codeVerifier: z.string().min(1),
  redirectUri: z.string().min(1),
  tokenEndpoint: z.string().url().optional(),
});

export const authStateDataSchema = z.strictObject({
  user: identitySchema.nullable(),
  tokens: authTokensSchema.nullable(),
  isAuthenticated: z.boolean(),
  intendedRoute: z.string().nullable(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
});

export const authContextDataSchema = z.strictObject({
  isAuthenticated: z.boolean(),
  user: identitySchema.nullable(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
  authReady: z.boolean(),
});

export const biometricSettingsSchema = z.strictObject({
  enabled: z.boolean(),
  declined: z.boolean(),
  lastPromptAt: z.number().int().nonnegative().optional(),
});

export const biometricSettingsSnapshotSchema =
  biometricSettingsSchema.partial();

const authPersistedTokensSchema = authTokensSchema.partial().nullable();

const authPersistedStateSchema = z.looseObject({
  tokens: authPersistedTokensSchema.optional(),
});

export const authPersistSnapshotSchema = z.looseObject({
  state: authPersistedStateSchema.optional(),
  version: z.number().optional(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type Identity = z.infer<typeof identitySchema>;
export type OidcStartAction = z.infer<typeof oidcStartActionSchema>;
export type StartWebLoginOptions = z.infer<typeof startWebLoginOptionsSchema>;
export type MobileOidcLoginParams = z.infer<typeof mobileOidcLoginParamsSchema>;
export type AuthStateData = z.infer<typeof authStateDataSchema>;
export type AuthContextData = z.infer<typeof authContextDataSchema>;
export type BiometricSettings = z.infer<typeof biometricSettingsSchema>;
export type BiometricSettingsSnapshot = z.infer<
  typeof biometricSettingsSnapshotSchema
>;
export type AuthPersistSnapshot = z.infer<typeof authPersistSnapshotSchema>;
