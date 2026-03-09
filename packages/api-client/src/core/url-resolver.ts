export type ApiClientConfig = {
  baseUrl?: string;
  protocol?: 'http' | 'https';
  baseDomain?: string;
  version?: string;
};

let current: ApiClientConfig = {};

export function initApiConfig(config: Partial<ApiClientConfig>): void {
  current = {...current, ...config};
}

export function getApiConfig(): Readonly<ApiClientConfig> {
  return current;
}

export function resolveBaseUrl(): string {
  if (current.baseUrl) {
    return current.baseUrl.replace(/\/$/, '');
  }

  const {protocol, baseDomain} = current;
  if (!protocol || !baseDomain) {
    throw new Error(
      'API base not configured. Call initApiConfig() at app startup.',
    );
  }

  return `${protocol}://${baseDomain}`;
}

export function resolveApiUrl(endpoint: string): string {
  const base = resolveBaseUrl();
  const version = current.version?.replace(/^\//, '');
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint.slice(1)
    : endpoint;
  const url = version
    ? `${base}/${version}/${normalizedEndpoint}`
    : `${base}/${normalizedEndpoint}`;

  return url.replace(/(?<!:)\/+/g, '/');
}

export function resolveAttachmentUrl(relativePath: string): string {
  return `${resolveBaseUrl()}${relativePath}`;
}
