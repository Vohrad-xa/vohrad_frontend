export function isWebRuntime(): boolean {
  return (
    typeof globalThis.window !== 'undefined' &&
    typeof globalThis.document !== 'undefined'
  );
}

export function getBrowserWindow(): Window & typeof globalThis {
  if (!isWebRuntime()) {
    throw new Error('Browser APIs are only available in web runtime.');
  }

  return globalThis.window;
}

export function getBrowserDocument(): Document {
  if (!isWebRuntime()) {
    throw new Error('Browser APIs are only available in web runtime.');
  }

  return globalThis.document;
}
