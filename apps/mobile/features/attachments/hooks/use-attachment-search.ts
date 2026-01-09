import {useMemo} from 'react';
import {
  buildAttachmentSearchODataFilter,
  useFilteredAttachmentsManager,
} from '@sykamore/store';
import type {AttachmentKind} from '@sykamore/types';

export interface UseAttachmentSearchOptions {
  searchQuery: string;
  pageSize?: number;
  enabled?: boolean;
  kind?: AttachmentKind;
  extension?: string;
  odataOrderBy?: string;
}

export function useAttachmentSearch(options: UseAttachmentSearchOptions) {
  const {
    searchQuery,
    pageSize = 50,
    enabled = true,
    kind,
    extension,
    odataOrderBy,
  } = options;

  const odataFilter = useMemo(
    () => buildAttachmentSearchODataFilter(searchQuery, extension),
    [searchQuery, extension],
  );
  const isSearchActive = Boolean(odataFilter);
  const shouldFetch = enabled && isSearchActive;

  const {
    attachments,
    error,
    hasNext,
    isLoading,
    loadMore,
    refresh,
    total,
    lastUpdated,
  } = useFilteredAttachmentsManager({
    kind,
    odataFilter,
    odataOrderBy,
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
    lastUpdated,
    isSearchActive,
  };
}
