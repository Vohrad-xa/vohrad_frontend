import React, {useCallback, useState} from 'react';
import {Platform} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {useNavigation} from 'expo-router';
import {
  ImagesGridScreen,
  useAttachmentImages,
  useAttachmentPress,
  useAttachmentShare,
  useAttachmentsHeader,
  useAttachmentsSnackbar,
} from '@/features/attachments';
import {useSearch} from '@/features/dashboard';
import {type ImageAttachmentItem} from '@/features/item';

export default function VaultImagesScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const handleAttachmentPress = useAttachmentPress();
  const {searchQuery} = useSearch();
  const [odataOrderBy, setOdataOrderBy] = useState<string | undefined>();
  const {showSnack, snackbar} = useAttachmentsSnackbar();
  const handleDeleteSuccess = useCallback(
    (count: number) => {
      showSnack(count === 1 ? '1 image deleted' : `${count} images deleted`);
    },
    [showSnack],
  );

  const {
    imageAttachments,
    loadMore,
    hasNext,
    isLoading,
    refresh,
    isSelectionMode,
    selectedCount,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    enableSelectionMode,
    disableSelectionMode,
    handleDeleteSelected,
    getSelectedImages,
  } = useAttachmentImages({
    odataOrderBy,
    searchQuery,
    enabled: isFocused,
    onDeleteSuccess: handleDeleteSuccess,
  });
  const {shareAttachments, isProcessing} = useAttachmentShare();

  const handleImagePress = useCallback(
    async (attachment: ImageAttachmentItem) => {
      if (isSelectionMode) {
        toggleSelection(attachment);
      } else {
        // ImageAttachmentItem extends ItemAttachment, so it's safe to pass
        await handleAttachmentPress(attachment);
      }
    },
    [isSelectionMode, toggleSelection, handleAttachmentPress],
  );

  const handleSelectModePress = useCallback(() => {
    enableSelectionMode();
  }, [enableSelectionMode]);

  const handleSelectAll = useCallback(() => {
    selectAll();
  }, [selectAll]);

  const handleDeselectAll = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleShareSelected = useCallback(async () => {
    const selectedImages = getSelectedImages();
    const count = selectedImages.length;
    if (count === 0) return;

    try {
      const shared = await shareAttachments(selectedImages);

      if (!shared) {
        if (Platform.OS === 'android') {
          disableSelectionMode();
        }
        return;
      }

      disableSelectionMode();
      showSnack(count === 1 ? '1 image shared' : `${count} images shared`);
    } catch (error) {
      console.error('Share operation failed:', error);
    }
  }, [getSelectedImages, shareAttachments, disableSelectionMode, showSnack]);

  useAttachmentsHeader({
    navigation,
    title: 'Library',
    labelSingular: 'image',
    labelPlural: 'images',
    isSelectionMode,
    selectedCount,
    totalCount: imageAttachments.length,
    onSelectAll: handleSelectAll,
    onDeselectAll: handleDeselectAll,
    onCancelSelection: disableSelectionMode,
    onShareSelected: handleShareSelected,
    onDeleteSelected: handleDeleteSelected,
    isProcessing,
    filter: {
      showExtensionFilter: false,
      odataOrderBy,
      onOrderByChange: setOdataOrderBy,
      onSelectPress: handleSelectModePress,
    },
  });

  return (
    <>
      <ImagesGridScreen
        imageAttachments={imageAttachments}
        loadMore={loadMore}
        hasNext={hasNext}
        isLoading={isLoading}
        refresh={refresh}
        onImagePress={handleImagePress}
        isSelected={isSelected}
      />
      {snackbar}
    </>
  );
}
