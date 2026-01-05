import {useCallback} from 'react';
import type {AttachmentFilter} from '@sykamore/types';
import {useAuthStore} from '../../store';
import {hasAttachmentExtension} from '../attachment/filters';

export function usePendingFilters() {
  return useAuthStore((state) => state.pendingFilters);
}

export function useSetPendingFilters() {
  return useAuthStore((state) => state.setPendingFilters);
}

export function useClearPendingFilters() {
  return useAuthStore((state) => state.clearPendingFilters);
}

export function useAttachmentFilter() {
  return useAuthStore((state) => state.attachmentFilter);
}

export function useSetAttachmentFilter() {
  return useAuthStore((state) => state.setAttachmentFilter);
}

export function useClearAttachmentFilter() {
  return useAuthStore((state) => state.clearAttachmentFilter);
}

const hasAttachmentFilterValues = (filter: AttachmentFilter | null) =>
  Boolean(
    filter?.targetType ||
    filter?.targetId ||
    filter?.itemName ||
    hasAttachmentExtension(filter) ||
    filter?.odataFilter ||
    filter?.odataOrderBy,
  );

/**
 * Update the attachment filter by merging partial fields or using a callback.
 */
export function useUpdateAttachmentFilter() {
  const attachmentFilter = useAuthStore((state) => state.attachmentFilter);
  const setAttachmentFilter = useAuthStore(
    (state) => state.setAttachmentFilter,
  );

  return useCallback(
    (
      update:
        | Partial<AttachmentFilter>
        | ((prev: AttachmentFilter | null) => AttachmentFilter | null),
    ) => {
      const next =
        typeof update === 'function'
          ? update(attachmentFilter)
          : {...(attachmentFilter ?? {}), ...update};

      if (!hasAttachmentFilterValues(next)) {
        setAttachmentFilter(null);
        return;
      }

      setAttachmentFilter(next);
    },
    [attachmentFilter, setAttachmentFilter],
  );
}
