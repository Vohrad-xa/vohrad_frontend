import type {ListAttachmentsParams} from '@sykamore/api-client';
import type {AttachmentTargetType} from '@sykamore/types';
import {normalizeAttachmentTargetType} from './normalizers';

export type AttachmentListFilters = Omit<
  ListAttachmentsParams,
  'limit' | 'cursor' | 'direction' | 'order'
>;

export type AttachmentListQueryKey = readonly [
  'attachments',
  'list',
  AttachmentListFilters,
  number,
];

export type AttachmentTargetQueryKey = readonly [
  'attachments',
  AttachmentTargetType,
  string | null,
];

/**
 * Builds the query key for attachment list caches.
 */
export function buildAttachmentListQueryKey(
  filters: AttachmentListFilters,
  pageSize: number,
): AttachmentListQueryKey {
  return ['attachments', 'list', filters, pageSize] as const;
}

/**
 * Builds the query key for target-specific attachment caches.
 */
export function buildAttachmentTargetQueryKey(
  targetType: AttachmentTargetType,
  targetId: string | null,
): AttachmentTargetQueryKey {
  return ['attachments', targetType, targetId] as const;
}

/**
 * Extracts list filters and page size from an attachments query key.
 *
 * - Returns null when the key shape does not match the list cache.
 */
export function parseAttachmentListQueryKey(
  queryKey: readonly unknown[],
): {filters: AttachmentListFilters; pageSize: number} | null {
  if (queryKey[0] !== 'attachments' || queryKey[1] !== 'list') {
    return null;
  }

  const filters = queryKey[2];
  const pageSize = queryKey[3];

  if (
    !filters ||
    typeof filters !== 'object' ||
    Array.isArray(filters) ||
    typeof pageSize !== 'number'
  ) {
    return null;
  }

  return {filters: filters as AttachmentListFilters, pageSize};
}

/**
 * Extracts target info from an attachments query key.
 *
 * - Returns null when the key shape does not match the target cache.
 */
export function parseAttachmentTargetQueryKey(
  queryKey: readonly unknown[],
): {targetType: AttachmentTargetType; targetId: string | null} | null {
  if (queryKey[0] !== 'attachments') {
    return null;
  }

  const targetType = normalizeAttachmentTargetType(
    typeof queryKey[1] === 'string' ? queryKey[1] : null,
  );
  if (!targetType) {
    return null;
  }

  const targetId = queryKey[2];
  if (typeof targetId === 'string') {
    return {targetType, targetId};
  }
  if (targetId === null) {
    return {targetType, targetId: null};
  }
  return null;
}
