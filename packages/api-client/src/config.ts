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

const defaultConfig: ApiClientConfig = {
  baseUrl: readEnv(['EXPO_PUBLIC_API_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL']),
  protocol: readEnv(['EXPO_PUBLIC_API_PROTOCOL', 'NEXT_PUBLIC_API_PROTOCOL']) as any,
  baseDomain: readEnv(['EXPO_PUBLIC_API_BASE_DOMAIN', 'NEXT_PUBLIC_API_BASE_DOMAIN']),
  tenant: undefined,
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

export function resolveBaseUrl(): string {
  const cfg = current;
  if (cfg.baseUrl) return cfg.baseUrl.replace(/\/$/, '');
  const proto = cfg.protocol;
  const domain = cfg.baseDomain;

  if (!proto || !domain) {
    throw new Error(
      'API base not configured. Set EXPO_PUBLIC_API_BASE_URL or (EXPO_PUBLIC_API_PROTOCOL + EXPO_PUBLIC_API_BASE_DOMAIN).',
    );
  }

  // DEVELOPMENT: Don't add subdomain to URL, send via X-Tenant-Subdomain header instead
  // PRODUCTION: Add subdomain to domain (tenant.yourdomain.com)
  return `${proto}://${domain}`;
}

export function resolveApiUrl(endpoint: string): string {
  const base = resolveBaseUrl();
  const ver = current.version?.replace(/^\//, '');
  const ep = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = ver ? `${base}/${ver}/${ep}` : `${base}/${ep}`;
  return url.replace(/(?<!:)\/+/g, '/');
}
