import {z} from 'zod';

export const socialProviderSchema = z.enum(['apple', 'google']);

const appleNameSchema = z.strictObject({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export const appleTokenExchangeUserProfileSchema = z
  .strictObject({
    name: appleNameSchema.optional(),
    email: z.email().optional(),
  })
  .refine(
    (value) =>
      Boolean(value.email || value.name?.firstName || value.name?.lastName),
    {
      message: 'Apple user profile must include at least one populated field.',
    },
  );

export const mobileSocialLoginParamsSchema = z.strictObject({
  provider: socialProviderSchema,
  token: z.string().min(1),
  userProfile: appleTokenExchangeUserProfileSchema.optional(),
});

export type SocialProvider = z.infer<typeof socialProviderSchema>;
export type AppleTokenExchangeUserProfile = z.infer<
  typeof appleTokenExchangeUserProfileSchema
>;
export type MobileSocialLoginParams = z.infer<
  typeof mobileSocialLoginParamsSchema
>;
