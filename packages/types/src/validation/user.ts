import {userSchema, userUpdateDataSchema} from '../schemas';
import type {z} from 'zod';

export type UserUpdateData = z.infer<typeof userUpdateDataSchema>;

export function validateUser(data: unknown) {
  return userSchema.safeParse(data);
}

export function validateUserUpdate(data: unknown) {
  return userUpdateDataSchema.safeParse(data);
}
