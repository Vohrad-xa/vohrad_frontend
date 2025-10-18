export const formatDate = (isoString?: string | null): string => {
  if (!isoString) return 'N/A';

  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};
