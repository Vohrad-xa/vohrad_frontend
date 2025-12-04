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

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const userCreateDataSchema = z.object({
  first_name: nameSchema.optional(),
  last_name: nameSchema.optional(),
  email: emailSchema,
  password: passwordSchema,
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

export type UserCreateData = z.infer<typeof userCreateDataSchema>;
export type UserUpdateData = z.infer<typeof userUpdateDataSchema>;
