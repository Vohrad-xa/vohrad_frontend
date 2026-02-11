import {useMemo} from 'react';
import type {AttachmentKind, AttachmentTargetType} from '@sykamore/types';
import {useAttachmentFilter} from '../../filter/hooks';
import {normalizeAttachmentExtension} from '../utils/normalizers';
import {useAttachmentsListManager} from './use-attachments-list-manager';

export interface UseFilteredAttachmentsManagerOptions {
  kind?: AttachmentKind;
  pageSize?: number;
  initialFilter?: {
    targetType?: AttachmentTargetType;
    targetId?: string;
  };
  extension?: string;
  searchQuery?: string;
  odataOrderBy?: string;
  enabled?: boolean;
}

const DEFAULT_ATTACHMENTS_PAGE_SIZE = 30;

/**
 * Attachment list manager that merges global filter state with local overrides.
 *
 * - Local extension/orderBy overrides global filter state.
 * - Defaults to 50 items per page.
 */
export function useFilteredAttachmentsManager(
  options?: UseFilteredAttachmentsManagerOptions,
) {
  const globalFilter = useAttachmentFilter();
  const {
    kind,
    pageSize = DEFAULT_ATTACHMENTS_PAGE_SIZE,
    initialFilter,
    enabled = true,
  } = options ?? {};

  const hasLocalExtension = Boolean(
    options && Object.prototype.hasOwnProperty.call(options, 'extension'),
  );

  const hasLocalOrderBy = Boolean(
    options && Object.prototype.hasOwnProperty.call(options, 'odataOrderBy'),
  );

  const localExtension = options?.extension;

  const localOrderBy = options?.odataOrderBy;

  const resolvedOrderBy = hasLocalOrderBy
    ? localOrderBy
    : globalFilter?.odataOrderBy;

  const resolvedExtension = hasLocalExtension
    ? localExtension
    : globalFilter?.extension;

  const normalizedExtension = normalizeAttachmentExtension(
    resolvedExtension ?? null,
  );

  const normalizedSearchQuery = options?.searchQuery?.trim() || undefined;

  const filters = useMemo(() => {
    const sourceTargetType =
      globalFilter?.targetType ?? initialFilter?.targetType;
    const sourceTargetId = globalFilter?.targetId ?? initialFilter?.targetId;

    return {
      ...(sourceTargetType ? {targetType: sourceTargetType} : {}),
      ...(sourceTargetId ? {targetId: sourceTargetId} : {}),
      ...(kind ? {kind} : {}),
      ...(normalizedExtension ? {extension: normalizedExtension} : {}),
      ...(normalizedSearchQuery ? {searchQuery: normalizedSearchQuery} : {}),
      ...(resolvedOrderBy ? {odataOrderBy: resolvedOrderBy} : {}),
    };
  }, [
    globalFilter?.targetType,
    globalFilter?.targetId,
    initialFilter?.targetType,
    initialFilter?.targetId,
    kind,
    normalizedExtension,
    normalizedSearchQuery,
    resolvedOrderBy,
  ]);

  const manager = useAttachmentsListManager({
    filters,
    pageSize,
    enabled,
  });

  return {
    attachments: manager.attachments,
    lastUpdated: manager.lastUpdated,
    isLoading: manager.isLoading,
    isFetchingNextPage: manager.isFetchingNextPage,
    error: manager.error,
    hasNext: manager.hasNext,
    loadMore: manager.loadMore,
    refresh: manager.refresh,
  };
}
