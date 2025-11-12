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

export type UserUpdateData = z.infer<typeof userUpdateDataSchema>;
