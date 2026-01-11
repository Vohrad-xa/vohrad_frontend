import {useCallback} from 'react';
import {
  useDeleteAttachment,
  useFilteredAttachmentsManager,
} from '@sykamore/store';
import {showConfirmAlert} from '@/utils';
import {useAttachmentContext} from '../providers/attachment-provider';
import {useAttachmentSearch} from './use-attachment-search';
import {useImageAttachments} from './use-image-items';
import {useImageSelection} from './use-image-selection';

type UseAttachmentImagesOptions = {
  odataOrderBy?: string;
  searchQuery?: string;
  enabled?: boolean;
  onDeleteSuccess?: (count: number) => void;
};

/**
 * Images list adapter with optional search/sort and selection actions.
 *
 * - When a targetId is present, uses context attachments instead of fetching.
 * - Calls `onDeleteSuccess` after confirmed deletions complete.
 */
export function useAttachmentImages(options?: UseAttachmentImagesOptions) {
  const {
    odataOrderBy,
    searchQuery = '',
    enabled = true,
    onDeleteSuccess,
  } = options ?? {};
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
    attachments: searchAttachments,
    loadMore: searchLoadMore,
    hasNext: searchHasNext,
    isLoading: searchIsLoading,
    refresh: searchRefresh,
    isSearchActive,
  } = useAttachmentSearch({
    searchQuery,
    kind: 'image',
    odataOrderBy,
    enabled: enabled && !targetId,
  });

  const {
    attachments: fetchedAttachments,
    loadMore,
    hasNext,
    isLoading,
    refresh,
  } = useFilteredAttachmentsManager({
    kind: 'image',
    odataOrderBy,
    enabled: enabled && !targetId && !isSearchActive,
  });

  // Use context attachments if available, otherwise use fetched attachments
  const attachments = targetId
    ? contextAttachments
    : isSearchActive
      ? searchAttachments
      : fetchedAttachments;
  const imageAttachments = useImageAttachments(attachments);
  const {mutateAsync: deleteAttachment} = useDeleteAttachment();

  const {
    isSelectionMode,
    selectedCount,
    toggleSelection,
    isSelected,
    selectAll,
    clearSelection,
    enableSelectionMode,
    disableSelectionMode,
    getSelectedImages,
  } = useImageSelection(imageAttachments);

  const handleDeleteSelected = useCallback(async () => {
    const selectedImages = getSelectedImages();
    if (selectedImages.length === 0) {
      return;
    }
    const deletedCount = selectedImages.length;

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
          onDeleteSuccess?.(deletedCount);
        } catch (error) {
          console.error('Failed to delete images:', error);
        }
      },
    });
  }, [
    getSelectedImages,
    deleteAttachment,
    disableSelectionMode,
    onDeleteSuccess,
  ]);

  const noopLoadMore = useCallback(() => {}, []);

  return {
    imageAttachments,
    isSelectionMode,
    selectedCount,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    enableSelectionMode,
    disableSelectionMode,
    getSelectedImages,
    handleDeleteSelected,
    loadMore: targetId
      ? (contextLoadMore ?? noopLoadMore)
      : isSearchActive
        ? searchLoadMore
        : loadMore,
    hasNext: targetId
      ? contextHasNext
      : isSearchActive
        ? searchHasNext
        : hasNext,
    isLoading: targetId
      ? Boolean(contextIsLoading)
      : isSearchActive
        ? searchIsLoading
        : isLoading,
    refresh: targetId
      ? contextRefresh
      : isSearchActive
        ? searchRefresh
        : refresh,
  };
}
