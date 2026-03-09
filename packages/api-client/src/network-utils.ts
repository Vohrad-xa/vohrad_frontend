import {resolveBaseUrl} from './core/url-resolver';

export const DEFAULT_REACHABILITY_TIMEOUT_MS = 3000;
export const DEFAULT_REACHABILITY_FALLBACK_URLS = [
  'https://www.gstatic.com/generate_204',
];

type ReachabilityOptions = {
  urls?: string[];
  includeBaseUrl?: boolean;
  method?: 'HEAD' | 'GET';
  timeoutMs?: number;
};

/**
 * Probes URLs sequentially and returns true as soon as one responds, false if all fail —
 * indicating the device has no network access and API calls should not be attempted.
 *
 * - Probes the configured API base URL first, then falls back to gstatic.com/generate_204 —
 *   for connectivity checks (always 204, zero body).
 * - Returns true immediately when fetch is unavailable (SSR/test) to avoid false negatives.
 */
export async function verifyNetworkReachability(
  options: ReachabilityOptions = {},
): Promise<boolean> {
  const fetchImpl = getFetchImplementation();
  if (!fetchImpl) return true;

  const targets = buildTargetList(options);
  if (targets.length === 0) return true;

  for (const target of targets) {
    const reachable = await probeUrl(fetchImpl, target, {
      method: options.method ?? 'HEAD',
      timeoutMs: options.timeoutMs ?? DEFAULT_REACHABILITY_TIMEOUT_MS,
    });

    if (reachable) return true;
  }

  return false;
}

function buildTargetList(options: ReachabilityOptions): string[] {
  const includeBase = options.includeBaseUrl !== false;
  const urls = options.urls ?? DEFAULT_REACHABILITY_FALLBACK_URLS;
  const targets = new Set<string>();

  if (includeBase) {
    const baseUrl = tryResolveBaseUrl();
    if (baseUrl) targets.add(baseUrl);
  }

  urls.forEach((url) => {
    if (typeof url === 'string' && url.length > 0) targets.add(url);
  });

  return Array.from(targets);
}

function tryResolveBaseUrl(): string | null {
  try {
    return resolveBaseUrl();
  } catch {
    return null;
  }
}

type ProbeParams = {
  method: 'HEAD' | 'GET';
  timeoutMs: number;
};

async function probeUrl(
  fetchImpl: typeof fetch,
  targetUrl: string,
  params: ProbeParams,
): Promise<boolean> {
  const AbortCtrl: typeof AbortController | undefined =
    typeof AbortController !== 'undefined' ? AbortController : undefined;
  const controller = AbortCtrl ? new AbortCtrl() : undefined;
  const timeoutId =
    controller && params.timeoutMs > 0
      ? setTimeout(() => controller.abort(), params.timeoutMs)
      : undefined;

  try {
    await fetchImpl(targetUrl, {
      method: params.method,
      signal: controller?.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// Binds fetch to globalThis to avoid illegal invocation errors in some runtimes.
function getFetchImplementation(): typeof fetch | null {
  if (typeof globalThis === 'undefined') return null;

  const fetchFn = (globalThis as typeof globalThis & {fetch?: typeof fetch})
    .fetch;
  return typeof fetchFn === 'function' ? fetchFn.bind(globalThis) : null;
}
