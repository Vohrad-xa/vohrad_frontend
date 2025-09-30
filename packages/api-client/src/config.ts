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

// Dynamic tenant detection for true subdomain architecture
const detectCurrentTenant = (): string | undefined => {
  // Web environment: extract from hostname
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    // For subdomains like tenant1.localhost or tenant1.myapp.com
    if (parts.length >= 3 && !hostname.includes('192.168.')) {
      return parts[0];
    }
  }
  // Fallback to environment variable (mobile and IP development)
  return readEnv(['EXPO_PUBLIC_TENANT', 'NEXT_PUBLIC_TENANT']);
};

// Prefer explicit base URL, otherwise build with dynamic tenant detection
const defaultConfig: ApiClientConfig = {
  baseUrl: readEnv(['EXPO_PUBLIC_API_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL']),
  protocol: readEnv(['EXPO_PUBLIC_API_PROTOCOL', 'NEXT_PUBLIC_API_PROTOCOL']) as any,
  baseDomain: readEnv(['EXPO_PUBLIC_API_BASE_DOMAIN', 'NEXT_PUBLIC_API_BASE_DOMAIN']),
  tenant: detectCurrentTenant(),
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

  // Check if domain is an IP address (contains only digits, dots, colons)
  const isIpAddress = /^[\d\.:]+$/.test(domain.split(':')[0]);
  const tenant = cfg.tenant;

  if (tenant && !isIpAddress && !domain.includes(tenant)) {
    // Production with domain: tenant.myapp.com
    return `${proto}://${tenant}.${domain}`;
  }

  // IP addresses or development fallback: just use domain as-is
  return `${proto}://${domain}`;
}

export function resolveApiUrl(endpoint: string): string {
  const base = resolveBaseUrl();
  const ver = current.version?.replace(/^\//, '');
  const ep = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = ver ? `${base}/${ver}/${ep}` : `${base}/${ep}`;
  return url.replace(/(?<!:)\/+/g, '/');
}
