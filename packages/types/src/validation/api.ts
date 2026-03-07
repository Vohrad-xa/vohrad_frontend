import type {z} from 'zod';
import {
  createApiResponseSchema,
  createPaginatedResponseSchema,
  apiResponseMetadataSchema,
} from '../schemas';
import {createValidator} from './parse';

export const validateApiResponseMetadata = createValidator(
  apiResponseMetadataSchema,
);

export function validateApiResponse<TSchema extends z.ZodTypeAny>(
  data: unknown,
  dataSchema: TSchema,
) {
  return createApiResponseSchema(dataSchema).safeParse(data);
}

export function validatePaginatedResponse<TSchema extends z.ZodTypeAny>(
  data: unknown,
  itemSchema: TSchema,
) {
  return createPaginatedResponseSchema(itemSchema).safeParse(data);
}
