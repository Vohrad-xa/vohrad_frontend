import type {ItemAttachment} from '@vohrad/types';
import type {AttachmentCacheEntry} from '../slice';

/**
 * Checks if an attachment should be included in a specific cache entry
 * based on the cache key pattern.
 */
export function shouldIncludeInCache(
  cacheKey: string,
  attachment: ItemAttachment,
): boolean {
  if (cacheKey === 'all') {
    return true;
  }

  if (!attachment.attachable_id || !attachment.attachable_type) {
    return false;
  }

  return (
    cacheKey.includes(`id:${attachment.attachable_id}`) &&
    cacheKey.includes(`type:${attachment.attachable_type}`)
  );
}

/**
 * Updates all cache entries by applying a transformation function.
 * Returns the updated cache object.
 */
export function updateAllCacheEntries(
  cache: Record<string, AttachmentCacheEntry>,
  updateFn: (
    cacheKey: string,
    entry: AttachmentCacheEntry,
  ) => AttachmentCacheEntry | null,
): Record<string, AttachmentCacheEntry> {
  const updatedCache = {...cache};

  Object.keys(updatedCache).forEach((cacheKey) => {
    const entry = updatedCache[cacheKey];
    const updated = updateFn(cacheKey, entry);
    if (updated) {
      updatedCache[cacheKey] = updated;
    }
  });

  return updatedCache;
}

/**
 * Adds an attachment to a cache entry if it should be included.
 */
export function addAttachmentToCacheEntry(
  cacheKey: string,
  entry: AttachmentCacheEntry,
  attachment: ItemAttachment,
): AttachmentCacheEntry | null {
  if (!shouldIncludeInCache(cacheKey, attachment)) {
    return null;
  }

  return {
    ...entry,
    attachments: [attachment, ...entry.attachments],
    total: entry.total + 1,
  };
}

/**
 * Removes an attachment from a cache entry by ID.
 */
export function removeAttachmentFromCacheEntry(
  entry: AttachmentCacheEntry,
  attachmentId: string,
): AttachmentCacheEntry | null {
  const filteredAttachments = entry.attachments.filter(
    (a) => a.id !== attachmentId,
  );

  if (filteredAttachments.length === entry.attachments.length) {
    return null; // No change
  }

  return {
    ...entry,
    attachments: filteredAttachments,
    total: Math.max(0, entry.total - 1),
  };
}

/**
 * Updates an attachment in a cache entry if it exists.
 */
export function updateAttachmentInCacheEntry(
  entry: AttachmentCacheEntry,
  attachment: ItemAttachment,
): AttachmentCacheEntry | null {
  const index = entry.attachments.findIndex((a) => a.id === attachment.id);

  if (index < 0) {
    return null; // Not found
  }

  const updatedAttachments = [...entry.attachments];
  updatedAttachments[index] = attachment;

  return {
    ...entry,
    attachments: updatedAttachments,
  };
}
