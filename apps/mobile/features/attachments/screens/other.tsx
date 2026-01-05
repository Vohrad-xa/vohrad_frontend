import {forwardRef} from 'react';
import {
  SelectableAttachmentsList,
  type SelectableAttachmentsListRef,
} from '../list/attachments-list';
import type {ItemAttachment} from '@sykamore/types';

type OtherListProps = {
  onOtherPress: (otherId: string) => void;
  others: ItemAttachment[];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
};

export type OtherListRef = SelectableAttachmentsListRef;

/**
 * Other attachments list wrapper for the shared attachment list template.
 */
export const OtherList = forwardRef<OtherListRef, OtherListProps>(
  (
    {
      onOtherPress,
      others,
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
        listKey="other"
        attachments={others}
        onAttachmentPress={onOtherPress}
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

OtherList.displayName = 'OtherList';
