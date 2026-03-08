import {z} from 'zod';
import {authTokensSchema} from './token';
import {identitySchema} from './user';

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

export const authPersistedTokensSchema = authTokensSchema.partial().nullable();

/**
 * Schema for validating the auth state after rehydration from secure storage.
 * Uses partial tokens — access_token is not persisted and will be absent until
 * the first token refresh at boot.
 */
export const authPersistedStateDataSchema = z.strictObject({
  user: identitySchema.nullable(),
  tokens: authPersistedTokensSchema,
  isAuthenticated: z.boolean(),
  intendedRoute: z.string().nullable(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
});

const authPersistedStateSchema = z.looseObject({
  tokens: authPersistedTokensSchema.optional(),
});

export const authPersistSnapshotSchema = z.looseObject({
  state: authPersistedStateSchema.optional(),
  version: z.number().optional(),
});

export type OidcStartAction = z.infer<typeof oidcStartActionSchema>;
export type StartWebLoginOptions = z.infer<typeof startWebLoginOptionsSchema>;
export type MobileOidcLoginParams = z.infer<typeof mobileOidcLoginParamsSchema>;
export type AuthStateData = z.infer<typeof authStateDataSchema>;
export type AuthPersistedStateData = z.infer<
  typeof authPersistedStateDataSchema
>;
export type AuthContextData = z.infer<typeof authContextDataSchema>;
export type BiometricSettings = z.infer<typeof biometricSettingsSchema>;
export type BiometricSettingsSnapshot = z.infer<
  typeof biometricSettingsSnapshotSchema
>;
export type AuthPersistSnapshot = z.infer<typeof authPersistSnapshotSchema>;
