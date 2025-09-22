// Cross-platform key-value storage helper.
// - Web: uses localStorage
// - Native: tries @react-native-async-storage/async-storage if installed
// - Fallback: in-memory Map (non-persistent)

const memory = new Map<string, string>();
const NS = '@vohrad:'; // namespace prefix for all keys

function ns(key: string) {
  return `${NS}${key}`;
}

interface GlobalWithStorage {
  localStorage?: Storage;
}

function hasLocalStorage(): boolean {
  try {
    return typeof (globalThis as GlobalWithStorage).localStorage !== 'undefined';
  } catch {
    return false;
  }
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-async-storage/async-storage') as AsyncStorageModule;
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
      // Migration: try legacy key (unscoped)
      const legacy = ls.getItem(key);
      if (legacy != null) {
        try {
          ls.setItem(k, legacy);
          ls.removeItem(key);
        } catch {}
        return legacy;
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
    // Migration: try legacy key
    const legacy = await as.getItem(key);
    if (legacy != null) {
      try {
        await as.setItem(k, legacy);
        await as.removeItem(key);
      } catch {}
      return legacy;
    }
  }
  // 3) In-memory fallback
  return memory.get(k) ?? memory.get(key) ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  const k = ns(key);
  if (hasLocalStorage()) {
    try {
      (globalThis as GlobalWithStorage).localStorage!.setItem(k, value);
      return;
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
