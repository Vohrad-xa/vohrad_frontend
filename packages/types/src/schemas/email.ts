import {z} from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .transform((email) => email.trim().toLowerCase());

export type Email = z.infer<typeof emailSchema>;
