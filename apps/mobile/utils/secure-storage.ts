import {Platform} from 'react-native';
import {validation} from '@sykamore/types';
import * as SecureStore from 'expo-secure-store';

const PREFIX = 'sykamore.secure.';
const fallbackMemory = new Map<string, string>();
const MAX_VALUE_LENGTH = 2000;
const META_SUFFIX = '.meta';
const CHUNK_SUFFIX = '.chunk.';
let secureStoreAvailable: boolean | null = null;

// Determine if SecureStore is available (cached to avoid repeated probes).
async function isSecureStoreAvailable(): Promise<boolean> {
  if (secureStoreAvailable !== null) {
    return secureStoreAvailable;
  }

  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
    if (!secureStoreAvailable && Platform.OS !== 'web') {
      console.warn(
        '[secure-storage] SecureStore unavailable, using volatile memory fallback.',
      );
    }
  } catch (error) {
    console.error(
      '[secure-storage] SecureStore availability check failed:',
      error,
    );
    secureStoreAvailable = false;
  }

  return secureStoreAvailable;
}

// Prefix keys to avoid collisions within SecureStore namespace.
function withPrefix(key: string) {
  if (!key) {
    throw new Error('[secure-storage] Key must be a non-empty string.');
  }

  return `${PREFIX}${key}`;
}

// Mirror latest value in memory fallback for temporary access when SecureStore fails.
function remember(key: string, value: string | null) {
  const namespaced = withPrefix(key);
  if (value === null) {
    fallbackMemory.delete(namespaced);
    return;
  }

  fallbackMemory.set(namespaced, value);
}

function parseChunkCount(meta: string): number | null {
  const parsedResult = validation.parseJson(meta);
  if (!parsedResult.success) {
    return null;
  }

  const metaResult = validation.validateSecureStoreChunkMeta(parsedResult.data);
  if (!metaResult.success) {
    return null;
  }

  return metaResult.data.chunks;
}

// Fetch value from SecureStore and rebuild chunked payloads when necessary.
async function readFromSecureStore(key: string): Promise<string | null> {
  try {
    const mainKey = withPrefix(key);
    const directValue = await SecureStore.getItemAsync(mainKey);
    if (directValue != null) {
      return directValue;
    }

    const meta = await SecureStore.getItemAsync(
      withPrefix(`${key}${META_SUFFIX}`),
    );
    if (!meta) {
      return null;
    }

    const chunks = parseChunkCount(meta);
    if (chunks === null) {
      return null;
    }

    const parts: string[] = [];
    for (let index = 0; index < chunks; index += 1) {
      const chunk = await SecureStore.getItemAsync(
        withPrefix(`${key}${CHUNK_SUFFIX}${index}`),
      );
      if (chunk == null) {
        console.error(
          '[secure-storage] Missing chunk while rebuilding value, clearing corrupted entry.',
          {
            key,
            chunkIndex: index,
          },
        );
        await clearChunkedValue(key);
        return null;
      }
      parts.push(chunk);
    }

    return parts.join('');
  } catch (error) {
    console.error('[secure-storage] Failed to read from SecureStore:', error);
    return null;
  }
}

// Pick platform-appropriate SecureStore write options.
function resolveSecureStoreOptions(): SecureStore.SecureStoreOptions {
  if (Platform.OS === 'ios') {
    return {keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY};
  }

  return {} as SecureStore.SecureStoreOptions;
}

// Persist value to SecureStore, chunking large payloads under the size limit.
async function writeToSecureStore(key: string, value: string): Promise<void> {
  const options = resolveSecureStoreOptions();
  try {
    if (value.length <= MAX_VALUE_LENGTH) {
      await clearChunkedValue(key);
      await SecureStore.setItemAsync(withPrefix(key), value, options);
      return;
    }

    await clearChunkedValue(key);
    await SecureStore.deleteItemAsync(withPrefix(key));

    const totalChunks = Math.ceil(value.length / MAX_VALUE_LENGTH);
    for (let index = 0; index < totalChunks; index += 1) {
      const start = index * MAX_VALUE_LENGTH;
      const end = start + MAX_VALUE_LENGTH;
      const chunk = value.slice(start, end);
      await SecureStore.setItemAsync(
        withPrefix(`${key}${CHUNK_SUFFIX}${index}`),
        chunk,
        options,
      );
    }

    await SecureStore.setItemAsync(
      withPrefix(`${key}${META_SUFFIX}`),
      JSON.stringify({chunks: totalChunks}),
      options,
    );
  } catch (error) {
    console.error('[secure-storage] Failed to write to SecureStore:', error);
    throw error;
  }
}

// Remove value and any associated chunks from SecureStore.
async function deleteFromSecureStore(key: string): Promise<void> {
  try {
    await clearChunkedValue(key);
    await SecureStore.deleteItemAsync(withPrefix(key));
  } catch (error) {
    console.error('[secure-storage] Failed to delete from SecureStore:', error);
    throw error;
  }
}

// Clear chunk metadata and fragments for a stored entry.
async function clearChunkedValue(key: string): Promise<void> {
  const metaKey = withPrefix(`${key}${META_SUFFIX}`);
  try {
    const meta = await SecureStore.getItemAsync(metaKey);
    if (!meta) {
      return;
    }

    const chunks = parseChunkCount(meta);
    if (chunks === null) {
      await SecureStore.deleteItemAsync(metaKey);
      return;
    }

    for (let index = 0; index < chunks; index += 1) {
      await SecureStore.deleteItemAsync(
        withPrefix(`${key}${CHUNK_SUFFIX}${index}`),
      );
    }

    await SecureStore.deleteItemAsync(metaKey);
  } catch (error) {
    console.warn('[secure-storage] Failed to clear chunked value:', error);
  }
}

// Read value via SecureStore when available, else use the fallback cache.
export async function getSecureItem(key: string): Promise<string | null> {
  const available = await isSecureStoreAvailable();

  if (available) {
    const value = await readFromSecureStore(key);
    remember(key, value);
    return value;
  }

  const fallbackValue = fallbackMemory.get(withPrefix(key)) ?? null;
  return fallbackValue;
}

// Write value into SecureStore and keep fallback cache in sync.
export async function setSecureItem(key: string, value: string): Promise<void> {
  const available = await isSecureStoreAvailable();
  if (available) {
    try {
      await writeToSecureStore(key, value);
      remember(key, value);
      return;
    } catch (error) {
      console.warn(
        '[secure-storage] Falling back to memory after write failure:',
        error,
      );
      remember(key, value);
      return;
    }
  }

  remember(key, value);
}

// Delete value from SecureStore and fallback cache.
export async function removeSecureItem(key: string): Promise<void> {
  const available = await isSecureStoreAvailable();
  if (available) {
    try {
      await deleteFromSecureStore(key);
    } catch (error) {
      console.error(
        '[secure-storage] Failed to remove item, clearing fallback copy only:',
        error,
      );
    }
  }
  remember(key, null);
}

export const secureStorage = {
  getItem: getSecureItem,
  setItem: setSecureItem,
  removeItem: removeSecureItem,
};
