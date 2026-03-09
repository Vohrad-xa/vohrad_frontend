import {ApiError} from '@sykamore/types';

export type RefreshFailureDisposition = 'transient' | 'terminal';

const TERMINAL_REFRESH_CODES = new Set([
  'SESSION_EXPIRED',
  'INVALID_SESSION_RESPONSE',
  'WEB_SESSION_INVALID',
  'OIDC_INVALID_GRANT',
]);

export function classifyRefreshFailure(
  error: unknown,
): RefreshFailureDisposition {
  if (!(error instanceof ApiError)) {
    return 'transient';
  }

  if (TERMINAL_REFRESH_CODES.has(error.code)) {
    return 'terminal';
  }

  if (error.status === 401 || error.status === 403) {
    return 'terminal';
  }

  if (error.status === 0) {
    return 'transient';
  }

  if (error.source === 'invalid_response') {
    return 'transient';
  }

  if (error.status >= 500) {
    return 'transient';
  }

  return 'transient';
}
