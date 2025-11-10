import type {AttachmentTargetType, AttachmentKind} from '@vohrad/types';

export interface AttachmentCacheFilters {
  targetType?: AttachmentTargetType;
  targetId?: string;
  kind?: AttachmentKind;
}

// creates a unique cache key based on attachment filters
export function createAttachmentCacheKey(
  filters: AttachmentCacheFilters,
): string {
  const {targetType, targetId, kind} = filters;

  // Empty filters = all attachments
  if (!targetType && !targetId && !kind) {
    return 'all';
  }

  // Sort keys alphabetically
  const parts: string[] = [];
  if (targetId) parts.push(`id:${targetId}`);
  if (kind) parts.push(`kind:${kind}`);
  if (targetType) parts.push(`type:${targetType}`);

  return parts.join('|');
}
