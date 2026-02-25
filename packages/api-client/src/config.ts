export type ApiClientConfig = {
  baseUrl?: string;
  protocol?: 'http' | 'https';
  baseDomain?: string;
  version?: string;
};

let current: ApiClientConfig = {};

/**
 * Sets the API client configuration; must be called at app startup before any request.
 *
 * - Merges into the current config, so partial updates are safe.
 * - Provide either `baseUrl` or both `protocol` + `baseDomain`.
 */
export function initApiConfig(config: Partial<ApiClientConfig>): void {
  current = {...current, ...config};
}

export function getApiConfig(): Readonly<ApiClientConfig> {
  return current;
}

export function resolveBaseUrl(): string {
  if (current.baseUrl) return current.baseUrl.replace(/\/$/, '');

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
  const ver = current.version?.replace(/^\//, '');
  const ep = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = ver ? `${base}/${ver}/${ep}` : `${base}/${ep}`;
  return url.replace(/(?<!:)\/+/g, '/');
}

// ONLY DEVELOPMENT USAGE FOR ATTACHMENT URLS
export function resolveAttachmentUrl(relativePath: string): string {
  return `${resolveBaseUrl()}${relativePath}`;
}
