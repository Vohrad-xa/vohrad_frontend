import {userUpdateDataSchema as baseUserUpdateDataSchema} from '../schemas';
import {emailSchema} from './email';
import type {z} from 'zod';

export const userUpdateSchema = baseUserUpdateDataSchema.extend({
  email: emailSchema.optional(),
});

export type UserUpdateData = z.infer<typeof userUpdateSchema>;

export function validateUserUpdate(data: unknown) {
  return userUpdateSchema.safeParse(data);
}
