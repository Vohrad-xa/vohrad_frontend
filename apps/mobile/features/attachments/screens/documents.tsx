import {forwardRef} from 'react';
import {
  SelectableAttachmentsList,
  type SelectableAttachmentsListRef,
} from '../list/attachments-list';
import type {ItemAttachment} from '@sykamore/types';

type DocumentsListProps = {
  onDocumentPress: (documentId: string) => void;
  documents: ItemAttachment[];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
};

export type DocumentsListRef = SelectableAttachmentsListRef;

/**
 * Documents list wrapper for the shared attachment list template.
 */
export const DocumentsList = forwardRef<DocumentsListRef, DocumentsListProps>(
  (
    {
      onDocumentPress,
      documents,
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
        listKey="documents"
        attachments={documents}
        onAttachmentPress={onDocumentPress}
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

DocumentsList.displayName = 'DocumentsList';
