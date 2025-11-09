import {useEffect, useMemo, useRef} from 'react';
import {useAttachmentsListManager, useVaultFilter} from '@vohrad/store';
import type {AttachmentKind, AttachmentTargetType} from '@vohrad/types';

interface UseVaultFilteredAttachmentsOptions {
  kind?: AttachmentKind;
}

/**
 * Custom hook that manages attachments list with vault filter synchronization.
 * Handles initialization and syncing of filters to avoid double fetches.
 *
 * @param options - Optional configuration
 * @param options.kind - Filter attachments by kind (e.g., 'image')
 * @returns Attachments list manager with vault filter synced
 */
export function useVaultFilteredAttachments(
  options?: UseVaultFilteredAttachmentsOptions,
) {
  const vaultFilter = useVaultFilter();
  const {kind} = options ?? {};

  // Initialize manager with current vault filter to avoid double fetch
  const initialFilters = useMemo(() => {
    const filters: {
      targetType?: AttachmentTargetType;
      targetId?: string;
      kind?: AttachmentKind;
    } = {};

    if (vaultFilter) {
      filters.targetType = vaultFilter.targetType;
      filters.targetId = vaultFilter.targetId;
    }

    if (kind) {
      filters.kind = kind;
    }

    return Object.keys(filters).length > 0 ? filters : kind ? {kind} : {};
  }, []);

  const manager = useAttachmentsListManager({initialFilters});
  const isInitialMount = useRef(true);

  // Sync filters with vault filter state (backend filtering)
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

    if (vaultFilter) {
      filters.targetType = vaultFilter.targetType;
      filters.targetId = vaultFilter.targetId;
    }

    if (kind) {
      filters.kind = kind;
    }

    manager.setFilters(Object.keys(filters).length > 0 ? filters : {});
  }, [vaultFilter, kind, manager.setFilters]);

  return manager;
}
