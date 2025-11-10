import type {ItemAttachment} from '@vohrad/types';
import type {AttachmentCacheEntry} from '../slice';
import {CACHE_CONFIG} from './cache-config';

export function appendPageToCacheEntry(
  entry: AttachmentCacheEntry,
  newPage: ItemAttachment[],
  pageParam: number,
): AttachmentCacheEntry {
  const updatedPages = [...entry.pages, newPage];
  const updatedPageParams = [...entry.pageParams, pageParam];

  // Enforce MAX_PAGES limit (drop oldest pages)
  const pagesToKeep =
    updatedPages.length > CACHE_CONFIG.MAX_PAGES
      ? updatedPages.slice(-CACHE_CONFIG.MAX_PAGES)
      : updatedPages;
  const paramsToKeep =
    updatedPageParams.length > CACHE_CONFIG.MAX_PAGES
      ? updatedPageParams.slice(-CACHE_CONFIG.MAX_PAGES)
      : updatedPageParams;

  return {
    ...entry,
    pages: pagesToKeep,
    pageParams: paramsToKeep,
    fetchedAt: Date.now(),
  };
}

// flatten all pages
export function getAllAttachmentsFromPages(
  pages: ItemAttachment[][],
): ItemAttachment[] {
  return pages.flat();
}

// Adds an attachment to the page
export function addAttachmentToPages(
  entry: AttachmentCacheEntry,
  attachment: ItemAttachment,
): AttachmentCacheEntry {
  const updatedPages = entry.pages.map((page) => {
    const exists = page.some((item) => item.id === attachment.id);
    if (exists) return page;
    return page;
  });

  const firstPageUpdated = [attachment, ...updatedPages[0]];
  const finalPages = [firstPageUpdated, ...updatedPages.slice(1)];

  return {
    ...entry,
    pages: finalPages,
    total: entry.total + 1,
    fetchedAt: Date.now(),
  };
}

// removes an attachment from all pages
export function removeAttachmentFromPages(
  entry: AttachmentCacheEntry,
  attachmentId: string,
): AttachmentCacheEntry {
  let found = false;
  const updatedPages = entry.pages.map((page) => {
    const filtered = page.filter((a) => a.id !== attachmentId);
    if (filtered.length !== page.length) found = true;
    return filtered;
  });

  if (!found) return entry;

  return {
    ...entry,
    pages: updatedPages,
    total: Math.max(0, entry.total - 1),
    fetchedAt: Date.now(),
  };
}

// updates an attachment across all pages
export function updateAttachmentInPages(
  entry: AttachmentCacheEntry,
  attachment: ItemAttachment,
): AttachmentCacheEntry {
  let found = false;
  const updatedPages = entry.pages.map((page) => {
    const index = page.findIndex((a) => a.id === attachment.id);
    if (index < 0) return page;

    found = true;
    const updated = [...page];
    updated[index] = attachment;
    return updated;
  });

  if (!found) return entry;

  return {
    ...entry,
    pages: updatedPages,
    fetchedAt: Date.now(),
  };
}

// cache staleness and eviction helpers
export function isStaleEntry(
  entry: AttachmentCacheEntry,
  staleTime: number = CACHE_CONFIG.STALE_TIME,
): boolean {
  if (!entry.fetchedAt) {
    return true;
  }

  const age = Date.now() - entry.fetchedAt;
  return age > staleTime;
}

// checks if cache has exceeded MAX_ENTRIES
export function shouldEvictCache(
  cache: Record<string, AttachmentCacheEntry>,
): boolean {
  return Object.keys(cache).length >= CACHE_CONFIG.MAX_ENTRIES;
}

// find the oldest cache key
export function getOldestCacheKey(
  cache: Record<string, AttachmentCacheEntry>,
): string | null {
  const entries = Object.entries(cache);

  if (entries.length === 0) {
    return null;
  }

  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  entries.forEach(([key, entry]) => {
    const fetchedAt = entry.fetchedAt ?? 0;
    if (fetchedAt < oldestTime) {
      oldestTime = fetchedAt;
      oldestKey = key;
    }
  });

  return oldestKey;
}

// removes the oldest cache entry (LRU eviction strategy)
export function evictOldestEntry(
  cache: Record<string, AttachmentCacheEntry>,
): Record<string, AttachmentCacheEntry> {
  const oldestKey = getOldestCacheKey(cache);

  if (!oldestKey) {
    return cache;
  }

  const {[oldestKey]: _removed, ...remainingCache} = cache;
  return remainingCache;
}
