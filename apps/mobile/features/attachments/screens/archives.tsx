import React, {forwardRef} from 'react';
import {
  SelectableAttachmentsList,
  type SelectableAttachmentsListRef,
} from '../list/attachments-list';
import type {ItemAttachment} from '@sykamore/types';

type ArchivesListProps = {
  onArchivePress: (archiveId: string) => void;
  archives: ItemAttachment[];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
};

export type ArchivesListRef = SelectableAttachmentsListRef;

/**
 * Archives list wrapper for the shared attachment list template.
 */
export const ArchivesList = forwardRef<ArchivesListRef, ArchivesListProps>(
  (
    {
      onArchivePress,
      archives,
      onEndReached,
      onEndReachedThreshold,
      onSelectionChange,
      onRefresh,
      isLoading,
      lastUpdated,
    },
    ref,
  ) => {
    return (
      <SelectableAttachmentsList
        ref={ref}
        listKey="archives"
        attachments={archives}
        onAttachmentPress={onArchivePress}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onSelectionChange={onSelectionChange}
        onRefresh={onRefresh}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />
    );
  },
);

ArchivesList.displayName = 'ArchivesList';
