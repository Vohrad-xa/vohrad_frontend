import React, {useCallback} from 'react';
import {useNavigation} from 'expo-router';
import {
  ImagesGridScreen,
  useAttachmentImages,
  useAttachmentPress,
} from '@/features/attachments';
import {type ImageAttachmentItem} from '@/features/item';
import {useSettingsHeader} from '@/hooks';

export default function VaultImagesScreen() {
  const navigation = useNavigation();
  const handleAttachmentPress = useAttachmentPress();

  const {
    isSelectionMode,
    selectedCount,
    isSelected,
    toggleSelection,
    enableSelectionMode,
    disableSelectionMode,
    handleDeleteSelected,
  } = useAttachmentImages();

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

  useSettingsHeader({
    navigation,
    isEditing: isSelectionMode,
    hasChanges: selectedCount > 0,
    onSave: enableSelectionMode,
    onCancel: disableSelectionMode,
    idleAction: 'select',
    onSelect: isSelectionMode ? undefined : enableSelectionMode,
    selectedCount,
    onDeleteSelected: selectedCount > 0 ? handleDeleteSelected : undefined,
  });

  return (
    <ImagesGridScreen onImagePress={handleImagePress} isSelected={isSelected} />
  );
}
