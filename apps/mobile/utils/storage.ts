import {Platform} from 'react-native';

// Cross-platform key-value storage helper.
// - Web: uses localStorage (unless bypassed for sensitive keys)
// - Native: tries @react-native-async-storage/async-storage if installed
// - Fallback: in-memory Map (non-persistent)

const memory = new Map<string, string>();
const NS = '@vohrad:'; // namespace prefix for all keys

// Keys whose payloads must never be persisted in browser storage.
const SENSITIVE_KEYS = new Set(['vohrad-auth']);

function ns(key: string) {
  return `${NS}${key}`;
}

interface GlobalWithStorage {
  localStorage?: Storage;
}

function hasLocalStorage(): boolean {
  try {
    return (
      typeof (globalThis as GlobalWithStorage).localStorage !== 'undefined'
    );
  } catch {
    return false;
  }
}

function isSensitiveKey(key: string): boolean {
  if (SENSITIVE_KEYS.has(key)) {
    return true;
  }
  if (key.startsWith(NS)) {
    const raw = key.slice(NS.length);
    return SENSITIVE_KEYS.has(raw);
  }
  return false;
}

// On Expo web, treat sensitive keys as ephemeral so tokens never land in localStorage.
function shouldBypassWebStorage(key: string): boolean {
  return Platform.OS === 'web' && isSensitiveKey(key);
}

interface AsyncStorageModule {
  default?: AsyncStorageInterface;
  getItem?: (key: string) => Promise<string | null>;
  setItem?: (key: string, value: string) => Promise<void>;
  removeItem?: (key: string) => Promise<void>;
}

interface AsyncStorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

async function tryLoadAsyncStorage(): Promise<AsyncStorageInterface | null> {
  try {
    const mod =
      (await import('@react-native-async-storage/async-storage')) as AsyncStorageModule;
    const AsyncStorage = mod?.default ?? mod;
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      return AsyncStorage as AsyncStorageInterface;
    }
  } catch {}
  return null;
}

export async function getItem(key: string): Promise<string | null> {
  const k = ns(key);
  // 1) Web localStorage
  if (hasLocalStorage()) {
    try {
      const ls = (globalThis as GlobalWithStorage).localStorage!;
      const val = ls.getItem(k);
      if (val != null) {
        return val;
      }
    } catch {}
  }
  // 2) Native AsyncStorage (if available)
  const as = await tryLoadAsyncStorage();
  if (as) {
    const val = await as.getItem(k);
    if (val != null) {
      return val;
    }
  }
  // 3) In-memory fallback
  return memory.get(k) ?? memory.get(key) ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  const k = ns(key);
  const bypassWebStorage = shouldBypassWebStorage(key);
  if (hasLocalStorage()) {
    try {
      const ls = (globalThis as GlobalWithStorage).localStorage!;
      if (bypassWebStorage) {
        ls.removeItem(k);
      } else {
        ls.setItem(k, value);
        return;
      }
    } catch {}
  }
  const as = await tryLoadAsyncStorage();
  if (as) {
    await as.setItem(k, value);
    return;
  }
  memory.set(k, value);
}

export async function removeItem(key: string): Promise<void> {
  const k = ns(key);
  if (hasLocalStorage()) {
    try {
      (globalThis as GlobalWithStorage).localStorage!.removeItem(k);
      return;
    } catch {}
  }
  const as = await tryLoadAsyncStorage();
  if (as) {
    await as.removeItem(k);
    return;
  }
  memory.delete(k);
}

const TENANT_KEY = 'tenant_subdomain';

export async function setTenantSubdomain(subdomain: string): Promise<void> {
  await setItem(TENANT_KEY, subdomain);
}

export async function getTenantSubdomain(): Promise<string | null> {
  return await getItem(TENANT_KEY);
}

export async function clearTenantSubdomain(): Promise<void> {
  await removeItem(TENANT_KEY);
}
