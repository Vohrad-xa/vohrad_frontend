export const formatDate = (isoString?: string | null): string => {
  if (!isoString) return 'N/A';

  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};
