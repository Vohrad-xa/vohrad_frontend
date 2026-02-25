function Hash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Derives a stable numeric version from an object's content by hashing its sorted JSON.
 *
 * - Key order is normalized before hashing so the same data always produces the same version.
 */
export function generateVersion<T extends object>(obj: T): number {
  const sortedObj = Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key as keyof T] = obj[key as keyof T];
      return acc;
    }, {} as T);

  return Hash(JSON.stringify(sortedObj));
}
