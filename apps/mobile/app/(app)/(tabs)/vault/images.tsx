import React, {useCallback} from 'react';
import {StyleSheet, View, FlatList} from 'react-native';
import {useRouter, useNavigation} from 'expo-router';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {SelectableImageTile, useAttachmentImages} from '@/features/attachments';
import {IMAGE_GRID_COLUMNS, type ImageAttachmentItem} from '@/features/item';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function VaultImagesScreen() {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);
  const router = useRouter();
  const navigation = useNavigation();

  const {
    imageAttachments,
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
          pathname: '/(modals)/preview',
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
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      columnWrapper: {
        width: '100%',
      },
      listContent: {
        paddingHorizontal: 0,
        paddingBottom: 0,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
