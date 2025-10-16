// Simple hash function to generate a number from a string.
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generates a version number from an object's content.
export function generateVersion<T extends object>(obj: T): number {
  // We can't sort the keys of the object directly, as that would
  // break the type inference. Instead, we create a new object
  // with the keys sorted.
  const sortedObj = Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key as keyof T] = obj[key as keyof T];
      return acc;
    }, {} as T);

  const json = JSON.stringify(sortedObj);
  return simpleHash(json);
}
