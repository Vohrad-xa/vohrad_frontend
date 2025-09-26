// Runtime API config (env + overrides)
export type ApiClientConfig = {
  baseUrl?: string;
  protocol?: 'http' | 'https';
  baseDomain?: string;
  tenant?: string;
  version?: string;
};

const envFromGlobal = (() => {
  try {
    return (globalThis as any)?.process?.env as Record<string, string | undefined> | undefined;
  } catch {
    return undefined;
  }
})();

const readEnv = (keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = envFromGlobal?.[k];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return undefined;
};

// Prefer explicit base URL, otherwise build from protocol + [tenant + '.'] + baseDomain
const defaultConfig: ApiClientConfig = {
  baseUrl: readEnv(['EXPO_PUBLIC_API_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL']),
  protocol: readEnv(['EXPO_PUBLIC_API_PROTOCOL', 'NEXT_PUBLIC_API_PROTOCOL']) as any,
  baseDomain: readEnv(['EXPO_PUBLIC_API_BASE_DOMAIN', 'NEXT_PUBLIC_API_BASE_DOMAIN']),
  tenant: readEnv(['EXPO_PUBLIC_TENANT', 'NEXT_PUBLIC_TENANT']),
  version: readEnv(['EXPO_PUBLIC_API_VERSION', 'NEXT_PUBLIC_API_VERSION']),
};

let current: ApiClientConfig = {...defaultConfig};

export function initApiConfig(partial?: Partial<ApiClientConfig>) {
  if (partial) current = {...current, ...partial};
}

export function setApiTenant(tenant?: string) {
  current = {...current, tenant};
}

export function getApiConfig(): Readonly<ApiClientConfig> {
  return current;
}

export function resolveBaseUrl(subdomain?: string): string {
  const cfg = current;
  if (cfg.baseUrl) return cfg.baseUrl.replace(/\/$/, '');
  const proto = cfg.protocol;
  const domain = cfg.baseDomain;
  if (!proto || !domain) {
    throw new Error(
      'API base not configured. Set EXPO_PUBLIC_API_BASE_URL or (EXPO_PUBLIC_API_PROTOCOL + EXPO_PUBLIC_API_BASE_DOMAIN).',
    );
  }
  const tenant = subdomain ?? cfg.tenant;
  const host = tenant ? `${tenant}.${domain}` : domain;
  return `${proto}://${host}`;
}

export function resolveApiUrl(endpoint: string, subdomain?: string): string {
  const base = resolveBaseUrl(subdomain);
  const ver = current.version?.replace(/^\//, '');
  const ep = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = ver ? `${base}/${ver}/${ep}` : `${base}/${ep}`;
  return url.replace(/(?<!:)\/+/g, '/');
}
