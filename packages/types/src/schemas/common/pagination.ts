import {z} from 'zod';

export const cursorDirectionSchema = z.enum(['before', 'after']);
export const cursorOrderSchema = z.enum(['asc', 'desc']);

export const paginationParamsSchema = z.strictObject({
  limit: z.number().int().positive().optional(),
  cursor: z.string().optional(),
  direction: cursorDirectionSchema.optional(),
  order: cursorOrderSchema.optional(),
});

export const paginationInfoSchema = z.strictObject({
  limit: z.number().int().nonnegative(),
  total_count: z.number().int().nonnegative().optional(),
  start_cursor: z.string().nullable(),
  end_cursor: z.string().nullable(),
  has_next_page: z.boolean(),
  has_previous_page: z.boolean(),
});

export type CursorDirection = z.infer<typeof cursorDirectionSchema>;
export type CursorOrder = z.infer<typeof cursorOrderSchema>;
export type PaginationParams = z.infer<typeof paginationParamsSchema>;
export type PaginationInfo = z.infer<typeof paginationInfoSchema>;
