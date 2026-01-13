import {useMemo} from 'react';
import type {AttachmentKind, AttachmentTargetType} from '@sykamore/types';
import {useAttachmentFilter} from '../../filter/hooks';
import {buildAttachmentODataFilter} from '../filters';
import {useAttachmentsListManager} from './use-attachments-list-manager';

export interface UseFilteredAttachmentsManagerOptions {
  kind?: AttachmentKind;
  pageSize?: number;
  initialFilter?: {
    targetType?: AttachmentTargetType;
    targetId?: string;
  };
  odataFilter?: string;
  odataOrderBy?: string;
  enabled?: boolean;
}

const DEFAULT_ATTACHMENTS_PAGE_SIZE = 50;

/**
 * Attachment list manager that merges global filter state with local overrides.
 *
 * - Local odataFilter/orderBy overrides global filter state.
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
  const hasLocalFilter = Boolean(
    options && Object.prototype.hasOwnProperty.call(options, 'odataFilter'),
  );
  const hasLocalOrderBy = Boolean(
    options && Object.prototype.hasOwnProperty.call(options, 'odataOrderBy'),
  );
  const localOdataFilter = options?.odataFilter;
  const localOrderBy = options?.odataOrderBy;
  const resolvedOrderBy = hasLocalOrderBy
    ? localOrderBy
    : globalFilter?.odataOrderBy;
  const globalOdataFilter = buildAttachmentODataFilter(globalFilter);
  const resolvedOdataFilter = hasLocalFilter
    ? localOdataFilter
    : globalOdataFilter;

  const filters = useMemo(() => {
    const sourceTargetType =
      globalFilter?.targetType ?? initialFilter?.targetType;
    const sourceTargetId = globalFilter?.targetId ?? initialFilter?.targetId;

    return {
      ...(sourceTargetType ? {targetType: sourceTargetType} : {}),
      ...(sourceTargetId ? {targetId: sourceTargetId} : {}),
      ...(kind ? {kind} : {}),
      ...(resolvedOdataFilter ? {odataFilter: resolvedOdataFilter} : {}),
      ...(resolvedOrderBy ? {odataOrderBy: resolvedOrderBy} : {}),
    };
  }, [
    globalFilter?.targetType,
    globalFilter?.targetId,
    initialFilter?.targetType,
    initialFilter?.targetId,
    kind,
    resolvedOdataFilter,
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
    error: manager.error,
    hasNext: manager.hasNext,
    loadMore: manager.loadMore,
    refresh: manager.refresh,
  };
}
