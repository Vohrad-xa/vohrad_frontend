import {z} from 'zod';

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_expires_in: z.number().optional(),
});

export const authTokensSchema = tokenResponseSchema.extend({
  issued_at: z.number().optional(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid().nullable().optional(),
  idp_subject: z.string().min(1),
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
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  pending_email: z.string().nullable().optional(),
  pending_email_requested_at: z.string().nullable().optional(),
  pending_email_expires_at: z.string().nullable().optional(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type User = z.infer<typeof userSchema>;
