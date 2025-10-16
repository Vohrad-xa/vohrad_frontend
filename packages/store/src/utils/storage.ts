const memory = new Map<string, string>();

export type AsyncKV = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

// Default backend: in-memory (apps inject platform storage at runtime)
const defaultStorage: AsyncKV = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return memory.get(name) ?? null;
    } catch (error) {
      console.warn('Storage getItem failed:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      memory.set(name, value);
    } catch (error) {
      console.warn('Storage setItem failed:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      memory.delete(name);
    } catch (error) {
      console.warn('Storage removeItem failed:', error);
    }
  },
};

let persistBackend: AsyncKV = defaultStorage;

export function setAuthPersistStorage(backend: AsyncKV) {
  if (
    backend &&
    typeof backend.getItem === 'function' &&
    typeof backend.setItem === 'function' &&
    typeof backend.removeItem === 'function'
  ) {
    persistBackend = backend;
  }
}

export function getPersistBackend(): AsyncKV {
  return persistBackend;
}
