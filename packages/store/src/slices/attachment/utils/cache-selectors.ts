import type {ItemAttachment} from '@vohrad/types';
import type {AttachmentCacheEntry} from '../slice';
import type {AttachmentCacheFilters} from './cache-key';
import {createAttachmentCacheKey} from './cache-key';

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

  if (baseEntry?.attachments?.length) {
    return baseEntry.attachments;
  }

  const merged = new Map<string, ItemAttachment>();

  Object.entries(cache).forEach(([key, entry]) => {
    if (!entry.attachments?.length || !matchesFilters(key, filters)) {
      return;
    }

    entry.attachments.forEach((attachment) => {
      if (!merged.has(attachment.id)) {
        merged.set(attachment.id, attachment);
      }
    });
  });

  if (merged.size === 0) {
    return null;
  }

  return Array.from(merged.values());
}
