import type {ItemAttachment} from '@vohrad/types';
import type {AttachmentCacheEntry} from '../slice';
import type {AttachmentCacheFilters} from './cache-key';
import {createAttachmentCacheKey} from './cache-key';
import {getAllAttachmentsFromPages} from './cache-helpers';

function matchesFilters(key: string, filters: AttachmentCacheFilters): boolean {
  const {targetType, targetId} = filters;

  if (targetType && targetId) {
    return key.includes(`type:${targetType}`) && key.includes(`id:${targetId}`);
  }

  if (targetType) {
    return key.includes(`type:${targetType}`);
  }

  if (targetId) {
    return key.includes(`id:${targetId}`);
  }

  return !key.includes('type:') && !key.includes('id:');
}

export function collectAttachmentsForFilters(
  cache: Record<string, AttachmentCacheEntry>,
  filters: AttachmentCacheFilters,
): ItemAttachment[] | null {
  const cacheKey = createAttachmentCacheKey(filters);
  const baseEntry = cache[cacheKey];

  // Return flattened pages from exact cache match
  if (baseEntry?.pages?.length) {
    return getAllAttachmentsFromPages(baseEntry.pages);
  }

  const merged = new Map<string, ItemAttachment>();

  // Fallback: Collect from all matching cache entries
  Object.entries(cache).forEach(([key, entry]) => {
    if (!entry.pages?.length || !matchesFilters(key, filters)) {
      return;
    }

    const allAttachments = getAllAttachmentsFromPages(entry.pages);
    allAttachments.forEach((attachment) => {
      if (!merged.has(attachment.id)) {
        merged.set(attachment.id, attachment);
      }
    });
  });

  if (merged.size === 0) {
    return null;
  }

  let result = Array.from(merged.values());

  // Client-side filter by kind if specified
  if (filters.kind) {
    result = result.filter((attachment) => attachment.kind === filters.kind);
  }

  return result.length > 0 ? result : null;
}
