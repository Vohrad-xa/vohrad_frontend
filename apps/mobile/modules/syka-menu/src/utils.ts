function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return hash;
}

export function objectHash(obj: Record<string, unknown>[]): string {
  if (!obj) {
    return '';
  }
  const jsonString = JSON.stringify(obj);
  const hash = hashCode(jsonString);
  return String(hash);
}
