import {z} from 'zod';
import {nullishToUndefined} from '../common';

export const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: nullishToUndefined(z.string().min(1)),
  token_type: z.string().min(1),
  expires_in: z.coerce.number().int().positive(),
  refresh_expires_in: nullishToUndefined(z.coerce.number().int().nonnegative()),
});

export const authTokensSchema = tokenResponseSchema.extend({
  issued_at: z.coerce.number().int().nonnegative().optional(),
  refresh_flow: z.enum(['oidc_direct', 'apple_exchange']).optional(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
