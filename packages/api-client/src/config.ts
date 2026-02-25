type Protocol = 'http' | 'https';

export type ApiClientConfig = {
  baseUrl?: string;
  protocol?: Protocol;
  baseDomain?: string;
  version?: string;
};

type GlobalWithEnv = {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

declare const process: {
  env: Record<string, string | undefined>;
};

const inlineEnv: Record<string, string | undefined> = {
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_API_PROTOCOL: process.env.EXPO_PUBLIC_API_PROTOCOL,
  EXPO_PUBLIC_API_BASE_DOMAIN: process.env.EXPO_PUBLIC_API_BASE_DOMAIN,
  EXPO_PUBLIC_API_VERSION: process.env.EXPO_PUBLIC_API_VERSION,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_API_PROTOCOL: process.env.NEXT_PUBLIC_API_PROTOCOL,
  NEXT_PUBLIC_API_BASE_DOMAIN: process.env.NEXT_PUBLIC_API_BASE_DOMAIN,
  NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
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
    const v = inlineEnv[k] ?? envFromGlobal?.[k];
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
  version: readEnv(['EXPO_PUBLIC_API_VERSION', 'NEXT_PUBLIC_API_VERSION']),
};

let current: ApiClientConfig = {...defaultConfig};

export function initApiConfig(partial?: Partial<ApiClientConfig>) {
  if (partial) current = {...current, ...partial};
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

  return `${proto}://${domain}`;
}

export function resolveApiUrl(endpoint: string): string {
  const base = resolveBaseUrl();
  const ver = current.version?.replace(/^\//, '');
  const ep = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = ver ? `${base}/${ver}/${ep}` : `${base}/${ep}`;
  return url.replace(/(?<!:)\/+/g, '/');
}

// ONLY DEVELOPMENT USAGE FOR ATTACHMENT URLS
export function resolveAttachmentUrl(relativePath: string): string {
  const baseUrl = resolveBaseUrl();
  return `${baseUrl}${relativePath}`;
}
