import {useCallback} from 'react';
import {Platform} from 'react-native';
import {useDeleteAttachment} from '@sykamore/store';
import {sanitizeInlineText, showConfirmAlert} from '@/utils';
import {useAttachmentShare} from './use-attachment-share';
import type {AttachmentsSelectionController} from './use-attachments-selection';
import type {ItemAttachment} from '@sykamore/types';

type UseAttachmentsBulkActionsOptions<T extends ItemAttachment> = {
  selection: AttachmentsSelectionController<T>;
  labelSingular: string;
  labelPlural: string;
  deleteTitle?: string;
  showSnack: (message: string) => void;
};

const capitalizeLabel = (value: string): string => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * Shared bulk actions for attachments (share + delete + confirmation).
 */
export function useAttachmentsBulkActions<T extends ItemAttachment>({
  selection,
  labelSingular,
  labelPlural,
  deleteTitle,
  showSnack,
}: UseAttachmentsBulkActionsOptions<T>) {
  const {shareAttachments, isProcessing} = useAttachmentShare();
  const {mutateAsync: deleteAttachment} = useDeleteAttachment();

  const handleDeleteSelected = useCallback(async () => {
    const selectedItems = selection.getSelectedItems();
    if (selectedItems.length === 0) return;

    const count = selectedItems.length;
    const deleteTitleText = deleteTitle ?? capitalizeLabel(labelPlural);
    const message =
      count === 1
        ? (() => {
            const attachment = selectedItems[0];
            const fallbackLabel = `this ${labelSingular}`;
            const fileName = sanitizeInlineText(
              attachment.original_filename ?? attachment.filename,
              fallbackLabel,
            );
            return `Are you sure you want to delete "${fileName}"?`;
          })()
        : `Are you sure you want to delete ${count} ${labelPlural}?`;

    showConfirmAlert({
      title: `Delete ${deleteTitleText}`,
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedItems.map((item) =>
              deleteAttachment({attachmentId: item.id}),
            ),
          );
          selection.disableSelectionMode();
          showSnack(
            count === 1
              ? `1 ${labelSingular} deleted`
              : `${count} ${labelPlural} deleted`,
          );
        } catch (error) {
          console.error('Failed to delete attachments:', error);
        }
      },
    });
  }, [
    selection,
    deleteTitle,
    labelPlural,
    labelSingular,
    deleteAttachment,
    showSnack,
  ]);

  const handleShareSelected = useCallback(async () => {
    const selectedItems = selection.getSelectedItems();
    const count = selectedItems.length;
    if (count === 0) return;

    const shared = await shareAttachments(selectedItems);

    if (!shared) {
      if (Platform.OS === 'android') {
        selection.disableSelectionMode();
      }
      return;
    }

    selection.disableSelectionMode();
    showSnack(
      count === 1
        ? `1 ${labelSingular} shared`
        : `${count} ${labelPlural} shared`,
    );
  }, [selection, labelSingular, labelPlural, shareAttachments, showSnack]);

  return {handleDeleteSelected, handleShareSelected, isProcessing};
}
