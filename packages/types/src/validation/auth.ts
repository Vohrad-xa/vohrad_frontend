import {z} from 'zod';
import {
  authPersistSnapshotSchema,
  authContextDataSchema,
  authPersistedStateDataSchema,
  authStateDataSchema,
  authTokensSchema,
  biometricSettingsSnapshotSchema,
  identitySchema,
  mobileOidcConfigSchema,
  mobileOidcLoginParamsSchema,
  mobileAppleLoginParamsSchema,
  oidcStartActionSchema,
  startWebLoginOptionsSchema,
  tenantMembershipSchema,
} from '../schemas';
import {createValidator} from './parse';

const tenantMembershipsSchema = z.array(tenantMembershipSchema);

export const validateAuthTokens = createValidator(authTokensSchema);
export const validateIdentity = createValidator(identitySchema);
export const validateTenantMemberships = createValidator(
  tenantMembershipsSchema,
);
export const validateOidcStartAction = createValidator(oidcStartActionSchema);
export const validateStartWebLoginOptions = createValidator(
  startWebLoginOptionsSchema,
);
export const validateMobileOidcLoginParams = createValidator(
  mobileOidcLoginParamsSchema,
);
export const validateMobileOidcConfig = createValidator(mobileOidcConfigSchema);
export const validateMobileAppleLoginParams = createValidator(
  mobileAppleLoginParamsSchema,
);
export const validateAuthStateData = createValidator(authStateDataSchema);
export const validateAuthPersistedStateData = createValidator(
  authPersistedStateDataSchema,
);
export const validateAuthContextData = createValidator(authContextDataSchema);
export const validateBiometricSettingsSnapshot = createValidator(
  biometricSettingsSnapshotSchema,
);
export const validateAuthPersistSnapshot = createValidator(
  authPersistSnapshotSchema,
);
