import type {AttachmentTargetType, AttachmentKind} from '@vohrad/types';

export interface AttachmentCacheFilters {
  targetType?: AttachmentTargetType;
  targetId?: string;
  kind?: AttachmentKind;
}

/**
 * Creates a unique cache key from attachment filters.
 * This enables multi-key caching similar to React Query's query keys.
 *
 * @example
 * createAttachmentCacheKey({}) // "all"
 * createAttachmentCacheKey({kind: 'image'}) // "kind:image"
 * createAttachmentCacheKey({targetType: 'item', targetId: '123'}) // "id:123|type:item"
 * createAttachmentCacheKey({targetType: 'item', targetId: '123', kind: 'image'}) // "id:123|kind:image|type:item"
 */
export function createAttachmentCacheKey(
  filters: AttachmentCacheFilters,
): string {
  const {targetType, targetId, kind} = filters;

  // Empty filters = all attachments
  if (!targetType && !targetId && !kind) {
    return 'all';
  }

  // Sort keys alphabetically for consistent cache keys regardless of filter order
  const parts: string[] = [];
  if (targetId) parts.push(`id:${targetId}`);
  if (kind) parts.push(`kind:${kind}`);
  if (targetType) parts.push(`type:${targetType}`);

  return parts.join('|');
}
