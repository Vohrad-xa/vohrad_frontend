import React, {useCallback, useEffect} from 'react';
import {StyleSheet, View, FlatList} from 'react-native';
import {
  useAttachmentsListManager,
  useAttachmentManager,
  useVaultFilter,
} from '@vohrad/store';
import {useRouter, useNavigation} from 'expo-router';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {SelectableImageTile, useImageSelection} from '@/features/attachments';
import {
  IMAGE_GRID_COLUMNS,
  useImageAttachments,
  type ImageAttachmentItem,
} from '@/features/item';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {showConfirmAlert, makeStyleFactory} from '@/utils';

export default function VaultImagesScreen() {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);
  const router = useRouter();
  const navigation = useNavigation();

  const vaultFilter = useVaultFilter();
  const filterTargetType = vaultFilter?.targetType;
  const filterTargetId = vaultFilter?.targetId;

  const {attachments, setFilters} = useAttachmentsListManager();

  // Sync filters with vault filter state (backend filtering), always filter for images
  useEffect(() => {
    if (vaultFilter) {
      setFilters({
        targetType: vaultFilter.targetType,
        targetId: vaultFilter.targetId,
        kind: 'image',
      });
    } else {
      setFilters({kind: 'image'});
    }
  }, [vaultFilter, setFilters]);

  const imageAttachments = useImageAttachments(attachments);
  const {deleteAttachment} = useAttachmentManager(filterTargetType, filterTargetId);

  const {
    isSelectionMode,
    selectedCount,
    toggleSelection,
    isSelected,
    enableSelectionMode,
    disableSelectionMode,
    getSelectedImages,
  } = useImageSelection(imageAttachments);

  const handleImagePress = useCallback(
    async (attachment: ImageAttachmentItem) => {
      if (isSelectionMode) {
        toggleSelection(attachment);
      } else {
        router.push({
          pathname: '/(modals)/preview',
          params: {
            attachmentId: attachment.id,
          },
        });
      }
    },
    [router, isSelectionMode, toggleSelection],
  );

  const handleSelect = useCallback(() => {
    enableSelectionMode();
  }, [enableSelectionMode]);

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

  useSettingsHeader({
    navigation,
    isEditing: isSelectionMode,
    hasChanges: selectedCount > 0,
    onSave: handleSelect,
    onCancel: disableSelectionMode,
    idleAction: 'select',
    onSelect: isSelectionMode ? undefined : handleSelect,
    selectedCount,
    onDeleteSelected: selectedCount > 0 ? handleDeleteSelected : undefined,
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={imageAttachments}
        keyExtractor={(attachment) => attachment.id}
        numColumns={IMAGE_GRID_COLUMNS}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({item: attachment}) => (
          <SelectableImageTile
            attachment={attachment}
            onPress={handleImagePress}
            isSelected={isSelected(attachment)}
            selectionMode={isSelectionMode}
            onToggleSelection={toggleSelection}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      columnWrapper: {
        width: '100%',
      },
      listContent: {
        paddingHorizontal: 0,
        paddingTop: ds.spacing.lg,
        paddingBottom: 0,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
