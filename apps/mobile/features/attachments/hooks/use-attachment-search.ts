import {useMemo} from 'react';
import {
  useFilteredAttachmentsManager,
  type AttachmentDisplayItem,
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

type UseAttachmentSearchResult = {
  attachments: AttachmentDisplayItem[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error: unknown;
  hasNext?: boolean;
  loadMore?: () => void;
  refresh?: () => void | Promise<void>;
  lastUpdated?: Date | null;
  isSearchActive: boolean;
};

export function useAttachmentSearch(
  options: UseAttachmentSearchOptions,
): UseAttachmentSearchResult {
  const {
    searchQuery,
    pageSize,
    enabled = true,
    kind,
    extension,
    odataOrderBy,
  } = options;

  const normalizedSearchQuery = useMemo(
    () => searchQuery.trim(),
    [searchQuery],
  );
  const isSearchActive = normalizedSearchQuery.length > 0;
  const shouldFetch = enabled && isSearchActive;

  const {
    attachments,
    error,
    hasNext,
    isLoading,
    isFetchingNextPage,
    loadMore,
    refresh,
    lastUpdated,
  } = useFilteredAttachmentsManager({
    kind,
    searchQuery: normalizedSearchQuery,
    extension,
    odataOrderBy,
    pageSize,
    enabled: shouldFetch,
  });

  return {
    attachments,
    isLoading,
    isFetchingNextPage,
    error,
    hasNext,
    loadMore,
    refresh,
    lastUpdated,
    isSearchActive,
  };
}
