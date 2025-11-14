import {resolveBaseUrl} from './config';

export const DEFAULT_REACHABILITY_TIMEOUT_MS = 3000;
export const DEFAULT_REACHABILITY_FALLBACK_URLS = [
  'https://www.gstatic.com/generate_204',
];

type ReachabilityOptions = {
  /**
   * Additional URLs to probe after the configured API base URL.
   */
  urls?: string[];
  /**
   * Whether to include the configured API base URL as the first probe target.
   * Defaults to true.
   */
  includeBaseUrl?: boolean;
  /**
   * Request method to use for the probe (HEAD by default).
   */
  method?: 'HEAD' | 'GET';
  /**
   * Timeout in milliseconds for each probe attempt.
   */
  timeoutMs?: number;
};

export async function verifyNetworkReachability(
  options: ReachabilityOptions = {},
): Promise<boolean> {
  const fetchImpl = getFetchImplementation();
  if (!fetchImpl) {
    // Environments without fetch shouldn't block the action.
    return true;
  }

  const targets = buildTargetList(options);
  if (targets.length === 0) {
    return true;
  }

  for (const target of targets) {
    const reachable = await probeUrl(fetchImpl, target, {
      method: options.method ?? 'HEAD',
      timeoutMs: options.timeoutMs ?? DEFAULT_REACHABILITY_TIMEOUT_MS,
    });

    if (reachable) {
      return true;
    }
  }

  return false;
}

function buildTargetList(options: ReachabilityOptions): string[] {
  const includeBase = options.includeBaseUrl !== false;
  const urls = options.urls ?? DEFAULT_REACHABILITY_FALLBACK_URLS;
  const targets = new Set<string>();

  if (includeBase) {
    const baseUrl = tryResolveBaseUrl();
    if (baseUrl) {
      targets.add(baseUrl);
    }
  }

  urls.forEach((url) => {
    if (typeof url === 'string' && url.length > 0) {
      targets.add(url);
    }
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

    // Any successful fetch (regardless of status) indicates the host is reachable.
    return true;
  } catch {
    return false;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function getFetchImplementation(): typeof fetch | null {
  if (typeof globalThis === 'undefined') {
    return null;
  }

  const fetchFn = (
    globalThis as typeof globalThis & {
      fetch?: typeof fetch;
    }
  ).fetch;

  return typeof fetchFn === 'function' ? fetchFn.bind(globalThis) : null;
}
