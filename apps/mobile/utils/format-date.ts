export const parseDateInput = (
  value?: string | null,
  fallback: Date = new Date(),
): Date => {
  if (!value) return new Date(fallback);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(fallback) : parsed;
};

export const formatDateInput = (date?: Date | null): string => {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatDate = (
  isoString?: string | null,
  options?: {includeTime?: boolean},
): string => {
  if (!isoString) return 'N/A';

  try {
    const date = new Date(isoString);
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      ...(options?.includeTime && {hour: '2-digit', minute: '2-digit'}),
    };
    return date.toLocaleDateString('en-GB', formatOptions);
  } catch {
    return 'Invalid date';
  }
};

export const formatDateShort = (isoString?: string | null): string => {
  if (!isoString) return 'N/A';

  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};
