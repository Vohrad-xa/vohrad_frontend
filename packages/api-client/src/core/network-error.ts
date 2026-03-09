import {ApiError} from '@sykamore/types';

export function normalizeTransportError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return ApiError.network(error.message || undefined, error);
  }

  return ApiError.unknown(undefined, error);
}

export function isExternalAbort(
  signal: AbortSignal | null | undefined,
  error: unknown,
): boolean {
  return Boolean(
    signal?.aborted &&
    error instanceof DOMException &&
    error.name === 'AbortError',
  );
}
