import {z} from 'zod';

export const mobileAppleLoginParamsSchema = z.strictObject({
  idToken: z.string().min(1),
});

export type MobileAppleLoginParams = z.infer<
  typeof mobileAppleLoginParamsSchema
>;
