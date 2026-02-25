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
  id: z.string().uuid(),
  tenant_id: z.string().uuid().nullable().optional(),
  idp_subject: z.string().nullable().optional(),
  email: z.string().email(),
  role_id: z.string().uuid().nullable().optional(),
  role_name: z.string().nullable().optional(),
  role_description: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  email_verified_at: z.string().nullable().optional(),
  pending_email: z.string().nullable().optional(),
  pending_email_requested_at: z.string().nullable().optional(),
  pending_email_expires_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
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
  email: emailSchema.optional(),
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
