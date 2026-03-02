// Metro inlines EXPO_PUBLIC_* at build time; this declaration avoids pulling in
// @types/node just to satisfy TypeScript's process.env reference.
declare const process: {env: Record<string, string | undefined>};

function read(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : undefined;
}

function readProtocol(key: string): 'http' | 'https' | undefined {
  const v = read(key);
  return v === 'http' || v === 'https' ? v : undefined;
}

const DEFAULT_OIDC_SCOPES = [
  'openid',
  'sykamore-claims',
  'sykamore-audience',
  'offline_access',
];

function readScopes(key: string): string[] {
  const v = read(key);
  if (!v) return DEFAULT_OIDC_SCOPES;
  const parsed = v.split(/[\s,]+/).filter((s) => s.length > 0);
  return parsed.length > 0 ? parsed : DEFAULT_OIDC_SCOPES;
}

/**
 * All EXPO_PUBLIC_* env vars for the mobile app, read once at module load.
 * Packages receive these as plain config — they never touch process.env directly.
 */
export const env = {
  api: {
    baseUrl: read('EXPO_PUBLIC_API_BASE_URL'),
    protocol: readProtocol('EXPO_PUBLIC_API_PROTOCOL'),
    baseDomain: read('EXPO_PUBLIC_API_BASE_DOMAIN'),
    version: read('EXPO_PUBLIC_API_VERSION'),
  },
  oidc: {
    issuerUrl: read('EXPO_PUBLIC_OIDC_ISSUER_URL'),
    mobileClientId: read('EXPO_PUBLIC_OIDC_MOBILE_CLIENT_ID'),
    scopes: readScopes('EXPO_PUBLIC_OIDC_MOBILE_SCOPES'),
    redirectUri: read('EXPO_PUBLIC_OIDC_MOBILE_REDIRECT_URI'),
  },
  google: {
    iosClientId: read('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'),
    androidClientId: read('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'),
    webClientId: read('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
  },
};
