declare const process: {
  env: {
    EXPO_PUBLIC_API_BASE_URL?: string;
    EXPO_PUBLIC_API_PROTOCOL?: string;
    EXPO_PUBLIC_API_BASE_DOMAIN?: string;
    EXPO_PUBLIC_API_VERSION?: string;
    EXPO_PUBLIC_OIDC_ISSUER_URL?: string;
    EXPO_PUBLIC_OIDC_MOBILE_CLIENT_ID?: string;
    EXPO_PUBLIC_OIDC_MOBILE_SCOPES?: string;
    EXPO_PUBLIC_OIDC_MOBILE_REDIRECT_URI?: string;
  };
};

const DEFAULT_OIDC_SCOPES = [
  'openid',
  'sykamore-claims',
  'sykamore-audience',
  'offline_access',
];

function read(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function readProtocol(value: string | undefined): 'http' | 'https' | undefined {
  const normalized = read(value);
  return normalized === 'http' || normalized === 'https'
    ? normalized
    : undefined;
}

function readScopes(value: string | undefined): string[] {
  const normalized = read(value);
  if (!normalized) return DEFAULT_OIDC_SCOPES;
  const parsed = normalized.split(/[\s,]+/).filter((scope) => scope.length > 0);
  return parsed.length > 0 ? parsed : DEFAULT_OIDC_SCOPES;
}

/**
 * All EXPO_PUBLIC_* env vars for the mobile app, read once at module load.
 * Packages receive these as plain config — they never touch process.env directly.
 */
export const env = {
  api: {
    baseUrl: read(process.env.EXPO_PUBLIC_API_BASE_URL),
    protocol: readProtocol(process.env.EXPO_PUBLIC_API_PROTOCOL),
    baseDomain: read(process.env.EXPO_PUBLIC_API_BASE_DOMAIN),
    version: read(process.env.EXPO_PUBLIC_API_VERSION),
  },
  oidc: {
    issuerUrl: read(process.env.EXPO_PUBLIC_OIDC_ISSUER_URL),
    mobileClientId: read(process.env.EXPO_PUBLIC_OIDC_MOBILE_CLIENT_ID),
    scopes: readScopes(process.env.EXPO_PUBLIC_OIDC_MOBILE_SCOPES),
    redirectUri: read(process.env.EXPO_PUBLIC_OIDC_MOBILE_REDIRECT_URI),
  },
};
