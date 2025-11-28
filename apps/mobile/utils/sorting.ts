export type SortOrder = 'asc' | 'desc';

// Sorts an array of items by a date field
export function sortByDate<T extends Record<string, unknown>>(
  items: T[],
  dateField: keyof T,
  order: SortOrder = 'desc',
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[dateField];
    const bValue = b[dateField];

    const aDate =
      typeof aValue === 'string' ? Date.parse(aValue) : Number(aValue) || 0;
    const bDate =
      typeof bValue === 'string' ? Date.parse(bValue) : Number(bValue) || 0;

    return order === 'asc' ? aDate - bDate : bDate - aDate;
  });
}

// Sorts an array of items by a string field
export function sortByString<T extends Record<string, unknown>>(
  items: T[],
  field: keyof T,
  order: SortOrder = 'asc',
): T[] {
  return [...items].sort((a, b) => {
    const aValue = String(a[field] || '');
    const bValue = String(b[field] || '');

    const comparison = aValue.localeCompare(bValue);
    return order === 'asc' ? comparison : -comparison;
  });
}

// Sorts an array of items by a numeric field
export function sortByNumber<T extends Record<string, unknown>>(
  items: T[],
  field: keyof T,
  order: SortOrder = 'asc',
): T[] {
  return [...items].sort((a, b) => {
    const aValue = Number(a[field]) || 0;
    const bValue = Number(b[field]) || 0;

    return order === 'asc' ? aValue - bValue : bValue - aValue;
  });
}
