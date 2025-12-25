export const sanitizeInlineText = (
  value: unknown,
  fallback: string,
): string => {
  const s =
    typeof value === 'string' ? value : value == null ? '' : String(value);
  const cleaned = s.replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : fallback;
};
