import {useEffect, useMemo, useRef} from 'react';
import {useAttachmentsListManager, useAttachmentFilter} from '@vohrad/store';
import type {AttachmentKind, AttachmentTargetType} from '@vohrad/types';

interface UseFilteredAttachmentsOptions {
  kind?: AttachmentKind;
}

/**
 * Custom hook that manages attachments list with attachment filter synchronization.
 * Handles initialization and syncing of filters to avoid double fetches.
 *
 * @param options - Optional configuration
 * @param options.kind - Filter attachments by kind (e.g., 'image')
 * @returns Attachments list manager with attachment filter synced
 */
export function useFilteredAttachments(
  options?: UseFilteredAttachmentsOptions,
) {
  const attachmentFilter = useAttachmentFilter();
  const {kind} = options ?? {};

  // Initialize manager with current attachment filter to avoid double fetch
  const initialFilters = useMemo(() => {
    const filters: {
      targetType?: AttachmentTargetType;
      targetId?: string;
      kind?: AttachmentKind;
    } = {};

    if (attachmentFilter) {
      filters.targetType = attachmentFilter.targetType;
      filters.targetId = attachmentFilter.targetId;
    }

    if (kind) {
      filters.kind = kind;
    }

    return Object.keys(filters).length > 0 ? filters : kind ? {kind} : {};
  }, []);

  const manager = useAttachmentsListManager({initialFilters});
  const isInitialMount = useRef(true);

  // Sync filters with attachment filter state (backend filtering)
  useEffect(() => {
    // Skip initial mount - manager already initialized with correct filters
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const filters: {
      targetType?: AttachmentTargetType;
      targetId?: string;
      kind?: AttachmentKind;
    } = {};

    if (attachmentFilter) {
      filters.targetType = attachmentFilter.targetType;
      filters.targetId = attachmentFilter.targetId;
    }

    if (kind) {
      filters.kind = kind;
    }

    manager.setFilters(Object.keys(filters).length > 0 ? filters : {});
  }, [attachmentFilter, kind, manager.setFilters]);

  return manager;
}
