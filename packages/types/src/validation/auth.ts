import {z} from 'zod';
import {
  authPersistSnapshotSchema,
  authContextDataSchema,
  authStateDataSchema,
  authTokensSchema,
  biometricSettingsSnapshotSchema,
  identitySchema,
  mobileOidcLoginParamsSchema,
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
export const validateAuthStateData = createValidator(authStateDataSchema);
export const validateAuthContextData = createValidator(authContextDataSchema);
export const validateBiometricSettingsSnapshot = createValidator(
  biometricSettingsSnapshotSchema,
);
export const validateAuthPersistSnapshot = createValidator(
  authPersistSnapshotSchema,
);
