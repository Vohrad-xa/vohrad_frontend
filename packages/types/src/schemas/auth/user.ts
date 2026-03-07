import {z} from 'zod';

export const identitySchema = z.strictObject({
  id: z.uuid(),
  email: z.email(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  email_verified_at: z.string().nullish(),
  user_type: z.enum(['user', 'admin']),
  is_super_admin: z.boolean(),
});

export type Identity = z.infer<typeof identitySchema>;
