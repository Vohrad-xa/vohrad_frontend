import {useCallback} from 'react';
import {
  useDeleteAttachment,
  useFilteredAttachmentsManager,
} from '@sykamore/store';
import {showConfirmAlert} from '@/utils';
import {useAttachmentContext} from '../providers/attachment-provider';
import {useImageAttachments} from './use-image-items';
import {useImageSelection} from './use-image-selection';

export function useAttachmentImages() {
  const {
    attachments: contextAttachments,
    targetId,
    loadMore: contextLoadMore,
    hasNext: contextHasNext,
    isLoading: contextIsLoading,
    refresh: contextRefresh,
  } = useAttachmentContext();

  // If we have a targetId, we're in item-specific mode and should use context data
  // Otherwise, fetch images from the server
  const {
    attachments: fetchedAttachments,
    loadMore,
    hasNext,
    isLoading,
    refresh,
  } = useFilteredAttachmentsManager({
    kind: 'image',
    enabled: !targetId,
  });

  // Use context attachments if available, otherwise use fetched attachments
  const attachments = targetId ? contextAttachments : fetchedAttachments;
  const imageAttachments = useImageAttachments(attachments);
  const {mutateAsync: deleteAttachment} = useDeleteAttachment();

  const {
    isSelectionMode,
    selectedCount,
    toggleSelection,
    isSelected,
    enableSelectionMode,
    disableSelectionMode,
    getSelectedImages,
  } = useImageSelection(imageAttachments);

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
            selectedImages.map((image) =>
              deleteAttachment({
                attachmentId: image.id,
              }),
            ),
          );
          disableSelectionMode();
        } catch (error) {
          console.error('Failed to delete images:', error);
        }
      },
    });
  }, [getSelectedImages, deleteAttachment, disableSelectionMode]);

  const noopLoadMore = useCallback(() => {}, []);

  return {
    imageAttachments,
    isSelectionMode,
    selectedCount,
    isSelected,
    toggleSelection,
    enableSelectionMode,
    disableSelectionMode,
    handleDeleteSelected,
    loadMore: targetId ? (contextLoadMore ?? noopLoadMore) : loadMore,
    hasNext: targetId ? contextHasNext : hasNext,
    isLoading: targetId ? Boolean(contextIsLoading) : isLoading,
    refresh: targetId ? contextRefresh : refresh,
  };
}
