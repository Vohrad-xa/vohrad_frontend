import {useMemo} from 'react';
import {useInfiniteAttachments, useAttachmentFilter} from '@vohrad/store';
import type {AttachmentKind, AttachmentTargetType} from '@vohrad/types';

type AttachmentFilterShape = {
  targetType?: AttachmentTargetType;
  targetId?: string;
  kind?: AttachmentKind;
};

export interface UseFilteredAttachmentsOptions {
  kind?: AttachmentKind;
  pageSize?: number;
  initialFilter?: {
    targetType?: AttachmentTargetType;
    targetId?: string;
  };
  enabled?: boolean;
}

export function useFilteredAttachments(
  options?: UseFilteredAttachmentsOptions,
) {
  const globalFilter = useAttachmentFilter();
  const {kind, pageSize, initialFilter, enabled = true} = options ?? {};

  // Combine global and local filters. The global filter takes precedence.
  const filters = useMemo((): AttachmentFilterShape => {
    const source = globalFilter ?? initialFilter;
    const shape: AttachmentFilterShape = {};

    if (source?.targetType) {
      shape.targetType = source.targetType;
    }
    if (source?.targetId) {
      shape.targetId = source.targetId;
    }
    if (kind) {
      shape.kind = kind;
    }
    return shape;
  }, [globalFilter, initialFilter, kind]);

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
