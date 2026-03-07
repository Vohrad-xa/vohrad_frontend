import {z} from 'zod';
import {emailSchema} from './email';
import {
  baseDateSchema,
  basePhoneSchema,
  createNameSchema,
  createPostalCodeSchema,
} from './common';
import {orderByDirectionSchema} from './attachment';

const nameSchema = createNameSchema();
const phoneSchema = basePhoneSchema;
const dateSchema = baseDateSchema;
const postalCodeSchema = createPostalCodeSchema();

const addressSchema = z
  .string()
  .max(255, 'Address cannot exceed 255 characters');
const cityOrProvinceSchema = z
  .string()
  .max(100, 'Field cannot exceed 100 characters');
const countryCodeSchema = z.string().length(2, 'Country must be 2 characters');

export const userSchema = z.strictObject({
  id: z.uuid(),
  tenant_id: z.uuid().nullable(),
  idp_subject: z.string(),
  email: z.email(),
  role_id: z.uuid().nullish(),
  role_name: z.string().nullish(),
  role_description: z.string().nullish(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  phone_number: z.string().nullish(),
  date_of_birth: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  province: z.string().nullish(),
  postal_code: z.string().nullish(),
  country: z.string().nullish(),
  email_verified_at: z.string().nullish(),
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const userCreateDataSchema = z.strictObject({
  first_name: nameSchema.optional(),
  last_name: nameSchema.optional(),
  email: emailSchema,
  phone_number: phoneSchema.optional(),
  date_of_birth: dateSchema.optional(),
  address: addressSchema.optional(),
  city: cityOrProvinceSchema.optional(),
  province: cityOrProvinceSchema.optional(),
  postal_code: postalCodeSchema.optional(),
  country: countryCodeSchema.optional(),
  role_id: z.string().optional(),
});

export const userUpdateDataSchema = z.strictObject({
  first_name: nameSchema.nullish(),
  last_name: nameSchema.nullish(),
  phone_number: phoneSchema.nullish(),
  date_of_birth: dateSchema.nullish(),
  address: addressSchema.nullish(),
  city: cityOrProvinceSchema.nullish(),
  province: cityOrProvinceSchema.nullish(),
  postal_code: postalCodeSchema.nullish(),
  country: countryCodeSchema.nullish(),
});

export const userSortKeySchema = z.enum(['date', 'name']);

export const userSortStateSchema = z.strictObject({
  key: userSortKeySchema,
  direction: orderByDirectionSchema,
});

export type User = z.infer<typeof userSchema>;
export type UserCreateData = z.infer<typeof userCreateDataSchema>;
export type UserUpdateData = z.infer<typeof userUpdateDataSchema>;
export type UserSortKey = z.infer<typeof userSortKeySchema>;
export type UserSortState = z.infer<typeof userSortStateSchema>;
