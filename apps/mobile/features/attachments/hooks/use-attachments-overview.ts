import {useMemo} from 'react';
import {
  useAttachmentFilter,
  useClearAttachmentFilter,
  useAuthStore,
  attachmentSelectors,
  shallow,
} from '@vohrad/store';
import {computeAttachmentCounts} from '../utils/attachment-counts';
import {
  useFilteredAttachments,
  type UseFilteredAttachmentsOptions,
} from './use-filtered-attachments';
import type {AttachmentCacheFilters} from '@vohrad/store';

export function useAttachmentsOverview(
  options?: UseFilteredAttachmentsOptions,
) {
  const attachmentFilter = useAttachmentFilter();
  const clearAttachmentFilter = useClearAttachmentFilter();
  const {attachments, filters, ...managerRest} =
    useFilteredAttachments(options);

  const cacheFilters = useMemo<AttachmentCacheFilters>(() => {
    const next: AttachmentCacheFilters = {};
    if (filters.targetType) {
      next.targetType = filters.targetType;
    }
    if (filters.targetId) {
      next.targetId = filters.targetId;
    }
    return next;
  }, [filters.targetId, filters.targetType]);

  const cachedAttachments = useAuthStore(
    useMemo(
      () => (state) =>
        attachmentSelectors.attachmentsFromCache(state)(cacheFilters),
      [cacheFilters],
    ),
    shallow,
  );

  const counts = useMemo(
    () => computeAttachmentCounts(cachedAttachments ?? attachments),
    [attachments, cachedAttachments],
  );

  const hasActiveFilter = Boolean(attachmentFilter);
  const filterInfo = attachmentFilter
    ? {
        targetType: attachmentFilter.targetType,
        targetId: attachmentFilter.targetId,
        itemName: attachmentFilter.itemName,
      }
    : null;

  return {
    attachments,
    counts,
    hasActiveFilter,
    filterInfo,
    clearFilter: clearAttachmentFilter,
    ...managerRest,
  };
}
