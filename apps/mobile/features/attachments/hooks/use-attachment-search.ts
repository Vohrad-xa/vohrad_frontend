import {useMemo} from 'react';
import {
  buildAttachmentSearchFilter,
  useAttachmentsListManager,
} from '@sykamore/store';

export interface UseAttachmentSearchOptions {
  searchQuery: string;
  pageSize?: number;
  enabled?: boolean;
}

export function useAttachmentSearch(options: UseAttachmentSearchOptions) {
  const {searchQuery, pageSize = 50, enabled = true} = options;

  const odataFilter = useMemo(
    () => buildAttachmentSearchFilter(searchQuery),
    [searchQuery],
  );

  const shouldFetch = enabled && Boolean(odataFilter);

  const {attachments, error, hasNext, isLoading, loadMore, refresh, total} =
    useAttachmentsListManager({
      filters: odataFilter ? {odataFilter} : {},
      pageSize,
      enabled: shouldFetch,
    });

  return {
    attachments,
    total,
    isLoading,
    error,
    hasNext,
    loadMore,
    refresh,
    isSearchActive: Boolean(odataFilter),
  };
}
