import React, {useCallback} from 'react';
import {useRouter, useNavigation} from 'expo-router';
import {useAttachmentImages} from '@/features/attachments';
import {ImagesGridScreen} from '@/features/attachments/screens/library';
import {type ImageAttachmentItem} from '@/features/item';
import {useSettingsHeader} from '@/hooks';

export default function VaultImagesScreen() {
  const router = useRouter();
  const navigation = useNavigation();

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
        router.push({
          pathname: '/(modals)/preview/image',
          params: {
            attachmentId: attachment.id,
          },
        });
      }
    },
    [router, isSelectionMode, toggleSelection],
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
