import {
  ApiError,
  createApiResponseSchema,
  parseJsonWithSchema,
  type AnySchema,
  type ApiResponse,
  type SchemaOutput,
} from '@sykamore/types';

export function parseSuccessResponse<TSchema extends AnySchema>(
  status: number,
  rawBody: string,
  dataSchema: TSchema,
): ApiResponse<SchemaOutput<TSchema>> {
  const responseSchema = createApiResponseSchema(dataSchema);

  if (rawBody.length === 0) {
    const emptyResponse = {
      success: true as const,
      data: undefined,
      message: null,
    };
    const parsedEmpty = responseSchema.safeParse(emptyResponse);
    if (!parsedEmpty.success) {
      throw ApiError.invalidResponse(status, undefined, parsedEmpty.error);
    }
    return parsedEmpty.data as ApiResponse<SchemaOutput<TSchema>>;
  }

  const parsedResponse = parseJsonWithSchema(rawBody, responseSchema);
  if (!parsedResponse.success) {
    throw ApiError.invalidResponse(status, undefined, parsedResponse.error);
  }

  return parsedResponse.data as ApiResponse<SchemaOutput<TSchema>>;
}
