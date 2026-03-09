import {
  ApiError,
  apiProblemDetailsSchema,
  parseJsonWithSchema,
} from '@sykamore/types';

export function parseProblemResponse(
  response: Response,
  rawBody: string,
): ApiError {
  if (rawBody.length > 0) {
    const parsedProblem = parseJsonWithSchema(rawBody, apiProblemDetailsSchema);
    if (parsedProblem.success) {
      return ApiError.fromProblem(parsedProblem.data);
    }
  }

  return ApiError.invalidResponse(
    response.status,
    response.statusText || `HTTP ${response.status}`,
  );
}
