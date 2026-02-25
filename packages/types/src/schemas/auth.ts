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

export const identitySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  email_verified_at: z.string().nullable().optional(),
  user_type: z.enum(['user', 'admin']),
  is_super_admin: z.boolean(),
});

export const tenantMembershipSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.string(),
  is_default: z.boolean(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type Identity = z.infer<typeof identitySchema>;
