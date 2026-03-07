import {z} from 'zod';
import {paginationParamsSchema} from '../common';
import {createApiResponseSchema, createPaginatedResponseSchema} from '../api';
import {itemDetailSchema, itemSchema} from './item';

export const listItemsParamsSchema = paginationParamsSchema.extend({
  odataFilter: z.string().optional(),
  count: z.boolean().optional(),
});

export const paginatedItemsSchema = createPaginatedResponseSchema(itemSchema);
export const listItemsResponseSchema =
  createApiResponseSchema(paginatedItemsSchema);
export const itemResponseSchema = createApiResponseSchema(itemSchema);
export const itemDetailResponseSchema =
  createApiResponseSchema(itemDetailSchema);

export type ListItemsParams = z.infer<typeof listItemsParamsSchema>;
export type PaginatedItems = z.infer<typeof paginatedItemsSchema>;
