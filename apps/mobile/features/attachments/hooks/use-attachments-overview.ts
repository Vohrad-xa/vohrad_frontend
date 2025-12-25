import {useMemo} from 'react';
import {
  useAttachmentFilter,
  useClearAttachmentFilter,
  useDashboardOverview,
} from '@sykamore/store';
import {computeAttachmentCounts} from '../utils';
import {
  useFilteredAttachments,
  type UseFilteredAttachmentsOptions,
} from './use-filtered-attachments';

/**
 * Overview helper for the vault:
 * - If a filter is active, compute counts from the filtered in-memory list.
 * - Otherwise, use dashboard counts (cheap, avoids recomputing on every render).
 */
export function useAttachmentsOverview(
  options?: UseFilteredAttachmentsOptions,
) {
  const attachmentFilter = useAttachmentFilter();
  const clearAttachmentFilter = useClearAttachmentFilter();
  const {data: dashboardData} = useDashboardOverview();

  const {attachments, ...rest} = useFilteredAttachments({...options});

  const counts = useMemo(() => {
    if (attachmentFilter) {
      return computeAttachmentCounts(attachments);
    }
    return (
      dashboardData?.attachment_counts ?? {
        image: 0,
        document: 0,
        video: 0,
        archive: 0,
        other: 0,
      }
    );
  }, [attachmentFilter, attachments, dashboardData]);

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
    ...rest,
  };
}
