import {z} from 'zod';
import {paginationInfoSchema} from './common';

export const apiResponseMetadataSchema = z.looseObject({
  timestamp: z.string().optional(),
  correlation_id: z.string().optional(),
  request_id: z.string().optional(),
  api_version: z.string().optional(),
  method: z.string().optional(),
  url: z.string().optional(),
  client_ip: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
});

const apiResponseBaseSchema = z.strictObject({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string(),
  metadata: apiResponseMetadataSchema.optional(),
});

const paginatedResponseBaseSchema = z.strictObject({
  items: z.array(z.unknown()),
  ...paginationInfoSchema.shape,
});

export function createApiResponseSchema<TSchema extends z.ZodTypeAny>(
  dataSchema: TSchema,
) {
  return apiResponseBaseSchema.extend({
    data: dataSchema,
  });
}

export function createPaginatedResponseSchema<TSchema extends z.ZodTypeAny>(
  itemSchema: TSchema,
) {
  return paginatedResponseBaseSchema.extend({
    items: z.array(itemSchema),
  });
}

export type ApiResponseMetadata = z.infer<typeof apiResponseMetadataSchema>;
export type ApiResponse<TData> = Omit<
  z.infer<typeof apiResponseBaseSchema>,
  'data'
> & {
  data: TData;
};
export type PaginatedResponse<TItem> = Omit<
  z.infer<typeof paginatedResponseBaseSchema>,
  'items'
> & {
  items: TItem[];
};
