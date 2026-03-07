import {z} from 'zod';
import {jsonObjectSchema, jsonValueSchema, type JsonValue} from './common';

export const tenantStatusSchema = z.enum(['active', 'inactive', 'suspended']);

const nullableStringSchema = z.string().nullish();

export const tenantSchema = z.strictObject({
  tenant_id: z.string().min(1),
  sub_domain: z.string().min(1),
  tenant_schema_name: z.string().min(1),
  email: z.email(),
  status: tenantStatusSchema,
  telephone: nullableStringSchema,
  street: nullableStringSchema,
  street_number: nullableStringSchema,
  city: nullableStringSchema,
  province: nullableStringSchema,
  postal_code: nullableStringSchema,
  country: nullableStringSchema,
  billing_address: nullableStringSchema,
  website: nullableStringSchema,
  logo: nullableStringSchema,
  industry: nullableStringSchema,
  tax_id: nullableStringSchema,
  remarks: nullableStringSchema,
  timezone: nullableStringSchema,
  business_hour_start: nullableStringSchema,
  business_hour_end: nullableStringSchema,
  license_id: nullableStringSchema,
  stripe_id: nullableStringSchema,
  settings: jsonObjectSchema.nullish(),
  created_by: nullableStringSchema,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: nullableStringSchema,
});

export const tenantSettingsUpdateSchema = z.strictObject({
  timezone: nullableStringSchema,
  business_hour_start: nullableStringSchema,
  business_hour_end: nullableStringSchema,
});

export const tenantProfileUpdateSchema = tenantSchema
  .pick({
    telephone: true,
    street: true,
    street_number: true,
    city: true,
    province: true,
    postal_code: true,
    country: true,
    billing_address: true,
    website: true,
    logo: true,
    industry: true,
    tax_id: true,
    remarks: true,
  })
  .partial();

export const licenseStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'expired',
]);

export const licenseSchema = z.strictObject({
  created_at: z.string(),
  updated_at: z.string(),
  id: z.string().min(1),
  tenant_id: z.string().min(1),
  name: z.string().min(1),
  price: z.string().min(1),
  seats: z.number().int(),
  license_key: z.string().min(1),
  starts_at: z.string(),
  ends_at: z.string(),
  status: licenseStatusSchema,
  features: jsonValueSchema.nullable(),
  meta: jsonValueSchema.nullable(),
});

export const tenantLicenseInfoSchema = z.strictObject({
  has_license: z.boolean(),
  license: licenseSchema.nullable(),
  seats_used: z.number().int(),
  seats_available: z.number().int(),
  seats_total: z.number().int(),
  is_active: z.boolean(),
});

export const tenantMembershipSchema = z.strictObject({
  tenant_id: z.uuid(),
  name: z.string(),
  role: z.string(),
  is_default: z.boolean(),
});

export type TenantStatus = z.infer<typeof tenantStatusSchema>;
export type Tenant = z.infer<typeof tenantSchema>;
export type TenantSettingsUpdate = z.infer<typeof tenantSettingsUpdateSchema>;
export type TenantProfileUpdate = z.infer<typeof tenantProfileUpdateSchema>;
export type LicenseStatus = z.infer<typeof licenseStatusSchema>;
export type License = z.infer<typeof licenseSchema>;
export type TenantLicenseInfo = z.infer<typeof tenantLicenseInfoSchema>;
export type TenantMembership = z.infer<typeof tenantMembershipSchema>;
export type {JsonValue};
