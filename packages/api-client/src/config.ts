type Protocol = 'http' | 'https';

export type ApiClientConfig = {
  baseUrl?: string;
  protocol?: Protocol;
  baseDomain?: string;
  tenant?: string;
  version?: string;
};

type GlobalWithEnv = {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const envFromGlobal = (() => {
  try {
    return (globalThis as GlobalWithEnv).process?.env;
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

const resolveProtocol = (value?: string): Protocol | undefined => {
  if (value === 'http' || value === 'https') {
    return value;
  }
  return undefined;
};

const defaultConfig: ApiClientConfig = {
  baseUrl: readEnv(['EXPO_PUBLIC_API_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL']),
  protocol: resolveProtocol(
    readEnv(['EXPO_PUBLIC_API_PROTOCOL', 'NEXT_PUBLIC_API_PROTOCOL']),
  ),
  baseDomain: readEnv([
    'EXPO_PUBLIC_API_BASE_DOMAIN',
    'NEXT_PUBLIC_API_BASE_DOMAIN',
  ]),
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

  // Check if domain is an IP address - if so, don't use subdomain (invalid DNS)
  const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain);

  // For IP addresses, tenant is sent via X-Tenant-Subdomain header (see http-client.ts)
  const fullDomain =
    cfg.tenant && !isIpAddress ? `${cfg.tenant}.${domain}` : domain;
  return `${proto}://${fullDomain}`;
}

export function resolveApiUrl(endpoint: string): string {
  const base = resolveBaseUrl();
  const ver = current.version?.replace(/^\//, '');
  const ep = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = ver ? `${base}/${ver}/${ep}` : `${base}/${ep}`;
  // LATER TODO : Add /api prefix for professional API structure
  // const url = ver ? `${base}/api/${ver}/${ep}` : `${base}/api/${ep}`;
  return url.replace(/(?<!:)\/+/g, '/');
}

// ONLY DEBELOPMENT USAGE FOR ATTACHMENT URLS
export function resolveAttachmentUrl(relativePath: string): string {
  const baseUrl = resolveBaseUrl();
  const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(
    current.baseDomain || '',
  );

  if (isIpAddress && current.tenant) {
    const urlObj = new URL(baseUrl);
    const tenantDomain = `${current.tenant}.${urlObj.host}`;
    const tenantUrl = `${urlObj.protocol}//${tenantDomain}`;
    return `${tenantUrl}${relativePath}`;
  }

  return `${baseUrl}${relativePath}`;
}
