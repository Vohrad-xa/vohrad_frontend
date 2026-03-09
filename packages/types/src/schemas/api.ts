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

export const apiProblemDetailsSchema = z.strictObject({
  type: z.string(),
  title: z.string(),
  status: z.coerce.number().int().nonnegative(),
  detail: z.string(),
  instance: z.string().optional(),
  code: z.string(),
  correlation_id: z.string().optional(),
  details: z.unknown().optional(),
});

export const emptyDataSchema = z.union([z.null(), z.undefined()]).transform(() => undefined);
export const textDataSchema = z.string();

const apiResponseBaseSchema = z.strictObject({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().nullable().optional(),
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

export type AnySchema = z.ZodTypeAny;
export type SchemaOutput<TSchema extends z.ZodTypeAny> = z.output<TSchema>;
export type ApiResponseMetadata = z.infer<typeof apiResponseMetadataSchema>;
export type ApiProblemDetails = z.infer<typeof apiProblemDetailsSchema>;
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
