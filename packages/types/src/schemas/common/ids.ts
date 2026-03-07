import {z} from 'zod';

export const uuidSchema = z.uuid();
export const nonEmptyIdSchema = z.string().min(1);
export const idListSchema = z.array(nonEmptyIdSchema);
