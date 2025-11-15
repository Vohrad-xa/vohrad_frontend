export function getNavigatorOnlineStatus(): boolean {
  const nav = (globalThis as {navigator?: {onLine?: boolean}}).navigator;
  if (typeof nav?.onLine === 'boolean') {
    return nav.onLine;
  }
  return true;
}
