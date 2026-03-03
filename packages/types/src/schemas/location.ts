import {z} from 'zod';

export const locationSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  parent_id: z.uuid().nullish(),
  description: z.string().nullish(),
  is_active: z.boolean(),
  path: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const locationCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters'),
  code: z
    .string()
    .trim()
    .min(1, 'Code is required')
    .max(50, 'Code cannot exceed 50 characters'),
  parent_id: z.uuid().nullish(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .nullish(),
  is_active: z.boolean().optional().default(true),
});

export const locationUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(255, 'Name cannot exceed 255 characters')
    .optional(),
  code: z
    .string()
    .trim()
    .min(1)
    .max(50, 'Code cannot exceed 50 characters')
    .optional(),
  parent_id: z.uuid().nullish(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .nullish(),
  is_active: z.boolean().optional(),
});

export type Location = z.infer<typeof locationSchema>;
export type LocationCreate = z.infer<typeof locationCreateSchema>;
export type LocationUpdate = z.infer<typeof locationUpdateSchema>;
