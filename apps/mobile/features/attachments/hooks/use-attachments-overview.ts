import {useMemo} from 'react';
import {useAttachmentFilter, useClearAttachmentFilter} from '@vohrad/store';
import {computeAttachmentCounts} from '../utils/attachment-counts';
import {useFilteredAttachments} from './use-filtered-attachments';
import type {AttachmentKind} from '@vohrad/types';

interface UseAttachmentsOverviewOptions {
  kind?: AttachmentKind;
}

export function useAttachmentsOverview(
  options?: UseAttachmentsOverviewOptions,
) {
  const attachmentFilter = useAttachmentFilter();
  const clearAttachmentFilter = useClearAttachmentFilter();
  const {attachments, ...managerRest} = useFilteredAttachments(options);

  const counts = useMemo(
    () => computeAttachmentCounts(attachments),
    [attachments],
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
