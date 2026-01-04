import {useMemo} from 'react';
import {useInfiniteAttachments, useAttachmentFilter} from '@sykamore/store';
import type {AttachmentKind, AttachmentTargetType} from '@sykamore/types';

export interface UseFilteredAttachmentsOptions {
  kind?: AttachmentKind;
  pageSize?: number;
  initialFilter?: {
    targetType?: AttachmentTargetType;
    targetId?: string;
  };
  enabled?: boolean;
}

/**
 * Returns a flat list of attachments with infinite pagination.
 *
 * Global filter (store) overrides local initialFilter.
 * Filters are memoized with primitive deps so inline initialFilter objects
 * don’t constantly change the queryKey.
 */
export function useFilteredAttachments(
  options?: UseFilteredAttachmentsOptions,
) {
  const globalFilter = useAttachmentFilter();
  const {kind, pageSize, initialFilter, enabled = true} = options ?? {};

  const odataFilter = useMemo(() => {
    if (globalFilter?.odataFilter) return globalFilter.odataFilter;
    if (globalFilter?.extension) {
      return `extension eq '${globalFilter.extension.toLowerCase()}'`;
    }
    return undefined;
  }, [globalFilter?.extension, globalFilter?.odataFilter]);

  const filters = useMemo(() => {
    const sourceTargetType =
      globalFilter?.targetType ?? initialFilter?.targetType;
    const sourceTargetId = globalFilter?.targetId ?? initialFilter?.targetId;

    return {
      ...(sourceTargetType ? {targetType: sourceTargetType} : {}),
      ...(sourceTargetId ? {targetId: sourceTargetId} : {}),
      ...(kind ? {kind} : {}),
      ...(odataFilter ? {odataFilter} : {}),
    };
  }, [
    globalFilter?.targetType,
    globalFilter?.targetId,
    initialFilter?.targetType,
    initialFilter?.targetId,
    kind,
    odataFilter,
  ]);

  const {data, error, fetchNextPage, hasNextPage, isFetching, refetch} =
    useInfiniteAttachments(filters, pageSize, enabled);

  const attachments = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  return {
    attachments,
    total: data?.pages[0]?.total ?? 0,
    isLoading: isFetching,
    error,
    hasNext: hasNextPage,
    loadMore: fetchNextPage,
    refresh: refetch,
  };
}
