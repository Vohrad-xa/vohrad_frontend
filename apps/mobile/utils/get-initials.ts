/**
 * Extracts initials from a full name.
 * Returns up to 2 initials (first letter of first name and first letter of last name).
 * Falls back to first two characters if only one name is provided.
 *
 * @param name - Full name (e.g., "John Doe", "Jane", "Mary Jane Smith")
 * @returns Uppercased initials (e.g., "JD", "J", "MJ")
 */
export function getInitials(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }

  //Split by whitespace and filter out empty parts
  const parts = trimmed.split(/\s+/).filter((part) => part.length > 0);

  if (parts.length === 0) {
    return '';
  }

  if (parts.length === 1) {
    // Single name: return first two characters
    const singleName = parts[0]!;
    return singleName.length === 1
      ? singleName.toUpperCase()
      : singleName.substring(0, 2).toUpperCase();
  }

  // Multiple names: first letter of first name + first letter of last name
  const firstInitial = parts[0]![0]!;
  const lastInitial = parts[parts.length - 1]![0]!;
  return (firstInitial + lastInitial).toUpperCase();
}
