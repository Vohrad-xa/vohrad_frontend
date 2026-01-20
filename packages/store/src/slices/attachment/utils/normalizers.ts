import type {AttachmentTargetType} from '@sykamore/types';

const ATTACHMENT_TARGET_TYPES: readonly AttachmentTargetType[] = [
  'item',
  'location',
  'item_location',
];

/**
 * Normalizes API target types to the known attachment target union.
 */
export function normalizeAttachmentTargetType(
  value?: string | null,
): AttachmentTargetType | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return ATTACHMENT_TARGET_TYPES.includes(normalized as AttachmentTargetType)
    ? (normalized as AttachmentTargetType)
    : null;
}

/**
 * Normalizes attachment extensions by trimming, lowercasing, and removing dots.
 */
export function normalizeAttachmentExtension(
  value?: string | null,
): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed.startsWith('.') ? trimmed.slice(1) : trimmed;
}
