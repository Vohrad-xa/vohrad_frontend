import {ApiError, type ApiErrorSource} from '@sykamore/types';

type AuthClientErrorInit = {
  status: number;
  code: string;
  title: string;
  detail: string;
  source?: ApiErrorSource;
  cause?: unknown;
};

function createAuthClientError(init: AuthClientErrorInit): ApiError {
  return new ApiError({
    ...init,
    source: init.source ?? 'unknown',
  });
}

export function createSignInStateError(
  detail = "We couldn't complete sign-in. Please try again.",
  code = 'INVALID_SIGN_IN_STATE',
): ApiError {
  return createAuthClientError({
    status: 400,
    code,
    title: 'Sign-In Failed',
    detail,
  });
}

export function createSignInUnavailableError(
  detail = 'Sign-in is not available right now.',
  code = 'SIGN_IN_UNAVAILABLE',
): ApiError {
  return createAuthClientError({
    status: 503,
    code,
    title: 'Sign-In Unavailable',
    detail,
  });
}

export function createInvalidAuthResponseError(
  detail = 'The sign-in service returned an invalid response.',
  code = 'INVALID_AUTH_RESPONSE',
  title = 'Sign-In Failed',
): ApiError {
  return createAuthClientError({
    status: 502,
    code,
    title,
    detail,
    source: 'invalid_response',
  });
}

export function createSessionExpiredError(
  detail = 'Your session has expired. Please sign in again.',
  code = 'SESSION_EXPIRED',
): ApiError {
  return createAuthClientError({
    status: 401,
    code,
    title: 'Session Expired',
    detail,
  });
}
