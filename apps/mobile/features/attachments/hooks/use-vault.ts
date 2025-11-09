import {useMemo} from 'react';
import {useVaultFilter, useClearVaultFilter} from '@vohrad/store';
import {computeAttachmentCounts} from '../utils/attachment-counts';
import {useVaultFilteredAttachments} from './use-vault-filtered-attachments';
import type {AttachmentKind} from '@vohrad/types';

interface UseVaultOptions {
  kind?: AttachmentKind;
}

/**
 * Comprehensive hook for vault functionality.
 * Encapsulates all vault-related state and logic.
 *
 * @param options - Optional configuration
 * @param options.kind - Filter attachments by kind (e.g., 'image')
 * @returns Complete vault state and actions
 */
export function useVault(options?: UseVaultOptions) {
  const vaultFilter = useVaultFilter();
  const clearVaultFilter = useClearVaultFilter();
  const {attachments, ...managerRest} = useVaultFilteredAttachments(options);

  // Compute attachment counts for overview tiles
  const counts = useMemo(
    () => computeAttachmentCounts(attachments),
    [attachments],
  );

  // Filter state for UI
  const hasActiveFilter = Boolean(vaultFilter);
  const filterInfo = vaultFilter
    ? {
        targetType: vaultFilter.targetType,
        targetId: vaultFilter.targetId,
        itemName: vaultFilter.itemName,
      }
    : null;

  return {
    // Attachments data
    attachments,
    counts,

    // Filter state
    hasActiveFilter,
    filterInfo,
    clearFilter: clearVaultFilter,

    // Manager utilities
    ...managerRest,
  };
}
