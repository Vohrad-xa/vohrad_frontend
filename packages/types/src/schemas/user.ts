import {z} from 'zod';
import {emailSchema} from './email';
import {
  createNameSchema,
  basePhoneSchema,
  baseDateSchema,
  createPostalCodeSchema,
} from '../validation/helpers';

const nameSchema = createNameSchema();
const phoneSchema = basePhoneSchema;
const dateSchema = baseDateSchema;
const postalCodeSchema = createPostalCodeSchema();

export const userSchema = z.object({
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

export const userCreateDataSchema = z.object({
  first_name: nameSchema.optional(),
  last_name: nameSchema.optional(),
  email: emailSchema,
  phone_number: phoneSchema.optional(),
  date_of_birth: dateSchema.optional(),
  address: z
    .string()
    .max(255, 'Address cannot exceed 255 characters')
    .optional(),
  city: z.string().max(100, 'City cannot exceed 100 characters').optional(),
  province: z
    .string()
    .max(100, 'Province cannot exceed 100 characters')
    .optional(),
  postal_code: postalCodeSchema.optional(),
  country: z.string().length(2, 'Country must be 2 characters').optional(),
  role_id: z.string().optional(),
});

export const userUpdateDataSchema = z.object({
  first_name: nameSchema.optional().nullable(),
  last_name: nameSchema.optional().nullable(),
  phone_number: phoneSchema.optional().nullable(),
  date_of_birth: dateSchema.optional().nullable(),
  address: z
    .string()
    .max(255, 'Address cannot exceed 255 characters')
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100, 'City cannot exceed 100 characters')
    .optional()
    .nullable(),
  province: z
    .string()
    .max(100, 'Province cannot exceed 100 characters')
    .optional()
    .nullable(),
  postal_code: postalCodeSchema.optional().nullable(),
  country: z
    .string()
    .length(2, 'Country must be 2 characters')
    .optional()
    .nullable(),
});

export type User = z.infer<typeof userSchema>;
export type UserCreateData = z.infer<typeof userCreateDataSchema>;
export type UserUpdateData = z.infer<typeof userUpdateDataSchema>;
