import {useMemo} from 'react';
import {
  buildAttachmentSearchODataFilter,
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
    isLoading,
    error,
    hasNext,
    loadMore,
    refresh,
    lastUpdated,
    isSearchActive,
  };
}
