import {getMobileOidcClientConfig} from '@sykamore/auth';
import {ApiError} from '@sykamore/types';
import * as WebBrowser from 'expo-web-browser';

type AppleLinkFallbackBase = {
  handled: true;
  completed: boolean;
  cancelled: boolean;
  error?: unknown;
};

export type AppleLinkFallbackResult = {handled: false} | AppleLinkFallbackBase;

type AttemptAppleLinkFallbackParams = {
  error: unknown;
  retryExchange: () => Promise<void>;
};

type AppleLinkRequiredProblemDetails = {
  accountLinkUrl: string;
};

export async function attemptAppleLinkFallback(
  params: AttemptAppleLinkFallbackParams,
): Promise<AppleLinkFallbackResult> {
  const parsedDetails = parseAppleLinkRequiredDetails(params.error);
  if (!parsedDetails) {
    return {handled: false};
  }

  const validatedLinkUrl = validateAccountLinkUrl(parsedDetails.accountLinkUrl);
  if (!validatedLinkUrl) {
    return {handled: false};
  }

  const redirectUri = getMobileOidcClientConfig().mobileRedirectUri;
  let authSessionResult: WebBrowser.WebBrowserAuthSessionResult;
  try {
    authSessionResult = await WebBrowser.openAuthSessionAsync(
      validatedLinkUrl,
      redirectUri,
    );
  } catch (openError) {
    return {
      handled: true,
      completed: false,
      cancelled: false,
      error: openError,
    };
  }

  if (
    authSessionResult.type === 'cancel' ||
    authSessionResult.type === 'dismiss'
  ) {
    return {
      handled: true,
      completed: false,
      cancelled: true,
    };
  }

  if (authSessionResult.type !== 'success') {
    return {
      handled: true,
      completed: false,
      cancelled: false,
      error: params.error,
    };
  }

  if (!matchesRedirectUri(authSessionResult.url, redirectUri)) {
    return {
      handled: true,
      completed: false,
      cancelled: false,
      error: params.error,
    };
  }

  try {
    await params.retryExchange();
    return {
      handled: true,
      completed: true,
      cancelled: false,
    };
  } catch (retryError) {
    return {
      handled: true,
      completed: false,
      cancelled: false,
      error: retryError,
    };
  }
}

function parseAppleLinkRequiredDetails(
  error: unknown,
): AppleLinkRequiredProblemDetails | null {
  if (!(error instanceof ApiError)) {
    return null;
  }
  if (error.code !== 'SOCIAL_LINK_REQUIRED') {
    return null;
  }

  const details = asRecord(error.details);
  if (!details) {
    return null;
  }

  const accountLinkUrl =
    typeof details.account_link_url === 'string'
      ? details.account_link_url.trim()
      : '';
  if (accountLinkUrl.length === 0) {
    return null;
  }

  return {
    accountLinkUrl,
  };
}

function validateAccountLinkUrl(accountLinkUrl: string): string | null {
  let issuer: URL;
  let accountLink: URL;
  try {
    issuer = new URL(getMobileOidcClientConfig().issuerUrl);
    accountLink = new URL(accountLinkUrl);
  } catch {
    return null;
  }

  if (accountLink.username || accountLink.password) {
    return null;
  }
  if (accountLink.hash.length > 0) {
    return null;
  }
  if (issuer.protocol !== 'https:' || accountLink.protocol !== 'https:') {
    return null;
  }
  if (accountLink.protocol !== issuer.protocol) {
    return null;
  }
  if (accountLink.host !== issuer.host) {
    return null;
  }

  return accountLink.toString();
}

function matchesRedirectUri(returnedUrl: string, redirectUri: string): boolean {
  try {
    const returned = new URL(returnedUrl);
    const expected = new URL(redirectUri);
    return (
      returned.protocol === expected.protocol &&
      returned.host === expected.host &&
      returned.pathname === expected.pathname
    );
  } catch {
    return returnedUrl.startsWith(redirectUri);
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}
