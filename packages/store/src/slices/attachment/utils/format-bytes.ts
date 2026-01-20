const formatDecimal = (
  value: number,
  decimals: number,
  mode: 'round' | 'floor',
): string => {
  const factor = 10 ** decimals;
  const scaled =
    mode === 'floor'
      ? Math.floor(value * factor) / factor
      : Math.round(value * factor) / factor;
  const text =
    decimals === 0
      ? `${scaled}`
      : scaled.toFixed(decimals).replace(/\.0+$/, '');
  return text.replace('.', ',');
};

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return 'Unknown size';
  if (bytes < 1024) return `${bytes} ${bytes === 1 ? 'byte' : 'bytes'}`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${formatDecimal(kb, 0, 'floor')} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${formatDecimal(mb, 1, 'round')} MB`;
  const gb = mb / 1024;
  return `${formatDecimal(gb, 1, 'round')} GB`;
}
