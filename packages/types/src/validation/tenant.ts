import {
  tenantSchema,
  tenantSettingsUpdateSchema,
  tenantProfileUpdateSchema,
  tenantLicenseInfoSchema,
  licenseSchema,
  tenantMembershipSchema,
} from '../schemas';
import {createValidator} from './parse';

export const validateTenant = createValidator(tenantSchema);
export const validateTenantSettingsUpdate = createValidator(
  tenantSettingsUpdateSchema,
);
export const validateTenantProfileUpdate = createValidator(
  tenantProfileUpdateSchema,
);
export const validateTenantLicenseInfo = createValidator(
  tenantLicenseInfoSchema,
);
export const validateLicense = createValidator(licenseSchema);
export const validateTenantMembership = createValidator(tenantMembershipSchema);
