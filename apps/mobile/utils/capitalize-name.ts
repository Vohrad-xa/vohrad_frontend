/**
 * Capitalizes the first letter of each word in a name.
 * Useful for displaying names in title case.
 *
 * @param name - Full name (e.g., "john doe", "JANE SMITH", "mary")
 * @returns Title-cased name (e.g., "John Doe", "Jane Smith", "Mary")
 */
export function capitalizeName(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }

  // Split by whitespace, capitalize each word, filter empty parts
  return trimmed
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
