import {useCallback} from 'react';
import {useAttachmentManager, useAttachmentFilter} from '@vohrad/store';
import {useImageAttachments} from '@/features/item';
import {showConfirmAlert} from '@/utils';
import {useFilteredAttachments} from './use-filtered-attachments';
import {useImageSelection} from './use-image-selection';

/**
 * Comprehensive hook for attachment images screen functionality.
 * Encapsulates all images-related state and logic.
 *
 * @returns Complete attachment images state and actions
 */
export function useAttachmentImages() {
  const attachmentFilter = useAttachmentFilter();
  const filterTargetType = attachmentFilter?.targetType ?? 'item';
  const filterTargetId = attachmentFilter?.targetId;

  // Fetch images with smart caching
  const {attachments} = useFilteredAttachments({kind: 'image'});

  // Convert to image attachments format
  const imageAttachments = useImageAttachments(attachments);

  // Get delete functionality
  const {deleteAttachment} = useAttachmentManager(
    filterTargetType,
    filterTargetId,
  );

  // Selection state management
  const {
    isSelectionMode,
    selectedCount,
    toggleSelection,
    isSelected,
    enableSelectionMode,
    disableSelectionMode,
    getSelectedImages,
  } = useImageSelection(imageAttachments);

  // Delete selected images handler
  const handleDeleteSelected = useCallback(async () => {
    const selectedImages = getSelectedImages();
    if (selectedImages.length === 0) {
      return;
    }

    const message =
      selectedImages.length === 1
        ? 'Are you sure you want to delete this image?'
        : `Are you sure you want to delete ${selectedImages.length} images?`;

    showConfirmAlert({
      title: 'Delete Images',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedImages.map((image) => deleteAttachment(image.id)),
          );
          disableSelectionMode();
        } catch (error) {
          console.error('Failed to delete images:', error);
        }
      },
    });
  }, [getSelectedImages, deleteAttachment, disableSelectionMode]);

  return {
    // Image data
    imageAttachments,

    // Selection state
    isSelectionMode,
    selectedCount,
    isSelected,

    // Selection actions
    toggleSelection,
    enableSelectionMode,
    disableSelectionMode,

    // Delete action
    handleDeleteSelected,
  };
}
