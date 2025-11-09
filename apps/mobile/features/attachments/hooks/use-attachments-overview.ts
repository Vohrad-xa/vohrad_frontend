import {useMemo} from 'react';
import {useAttachmentFilter, useClearAttachmentFilter} from '@vohrad/store';
import {computeAttachmentCounts} from '../utils/attachment-counts';
import {useFilteredAttachments} from './use-filtered-attachments';
import type {AttachmentKind} from '@vohrad/types';

interface UseAttachmentsOverviewOptions {
  kind?: AttachmentKind;
}

/**
 * Comprehensive hook for attachments overview functionality.
 * Encapsulates all attachments-related state and logic.
 *
 * @param options - Optional configuration
 * @param options.kind - Filter attachments by kind (e.g., 'image')
 * @returns Complete attachments overview state and actions
 */
export function useAttachmentsOverview(
  options?: UseAttachmentsOverviewOptions,
) {
  const attachmentFilter = useAttachmentFilter();
  const clearAttachmentFilter = useClearAttachmentFilter();
  const {attachments, ...managerRest} = useFilteredAttachments(options);

  // Compute attachment counts for overview tiles
  const counts = useMemo(
    () => computeAttachmentCounts(attachments),
    [attachments],
  );

  // Filter state for UI
  const hasActiveFilter = Boolean(attachmentFilter);
  const filterInfo = attachmentFilter
    ? {
        targetType: attachmentFilter.targetType,
        targetId: attachmentFilter.targetId,
        itemName: attachmentFilter.itemName,
      }
    : null;

  return {
    // Attachments data
    attachments,
    counts,

    // Filter state
    hasActiveFilter,
    filterInfo,
    clearFilter: clearAttachmentFilter,

    // Manager utilities
    ...managerRest,
  };
}
