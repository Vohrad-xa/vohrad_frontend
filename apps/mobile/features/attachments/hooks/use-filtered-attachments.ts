import {useMemo} from 'react';
import {
  buildAttachmentODataFilter,
  useInfiniteAttachments,
  useAttachmentFilter,
} from '@sykamore/store';
import type {AttachmentKind, AttachmentTargetType} from '@sykamore/types';

export interface UseFilteredAttachmentsOptions {
  kind?: AttachmentKind;
  pageSize?: number;
  initialFilter?: {
    targetType?: AttachmentTargetType;
    targetId?: string;
  };
  odataOrderBy?: string;
  enabled?: boolean;
}

/**
 * Returns a flat list of attachments with infinite pagination.
 *
 * - Global filter (store) overrides local initialFilter.
 * - Local odataOrderBy (when provided) overrides global sorting.
 * - Filters are memoized with primitive deps so inline initialFilter objects
 *   don’t constantly change the queryKey.
 */
export function useFilteredAttachments(
  options?: UseFilteredAttachmentsOptions,
) {
  const globalFilter = useAttachmentFilter();
  const {kind, pageSize, initialFilter, enabled = true} = options ?? {};
  const hasLocalOrderBy = Boolean(
    options && Object.prototype.hasOwnProperty.call(options, 'odataOrderBy'),
  );
  const localOrderBy = options?.odataOrderBy;
  const resolvedOrderBy = hasLocalOrderBy
    ? localOrderBy
    : globalFilter?.odataOrderBy;
  const odataFilter = buildAttachmentODataFilter(globalFilter);

  const filters = useMemo(() => {
    const sourceTargetType =
      globalFilter?.targetType ?? initialFilter?.targetType;
    const sourceTargetId = globalFilter?.targetId ?? initialFilter?.targetId;

    return {
      ...(sourceTargetType ? {targetType: sourceTargetType} : {}),
      ...(sourceTargetId ? {targetId: sourceTargetId} : {}),
      ...(kind ? {kind} : {}),
      ...(odataFilter ? {odataFilter} : {}),
      ...(resolvedOrderBy ? {odataOrderBy: resolvedOrderBy} : {}),
    };
  }, [
    globalFilter?.targetType,
    globalFilter?.targetId,
    initialFilter?.targetType,
    initialFilter?.targetId,
    kind,
    odataFilter,
    resolvedOrderBy,
  ]);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useInfiniteAttachments(filters, pageSize, enabled);

  const attachments = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  return {
    attachments,
    total: data?.pages[0]?.total ?? 0,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    isLoading: isFetching,
    error,
    hasNext: hasNextPage,
    loadMore: fetchNextPage,
    refresh: refetch,
  };
}
