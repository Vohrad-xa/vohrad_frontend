import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {useRouter} from 'expo-router';
import {EmptyState, ModalFlatList} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  AttachmentImageTile,
  IMAGE_GRID_COLUMNS,
  useImageAttachments,
} from '@/features/item/detail/attachments/attachments-images';
import type {ImageAttachmentItem} from '@/features/item/detail/attachments/attachments-images';
import {useItemAttachments} from '@/features/item/detail/attachments/use-item-attachments';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ItemImageAttachmentsModal() {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);
  const router = useRouter();
  const {attachments, item} = useItemAttachments();
  const imageAttachments = useImageAttachments(attachments);

  const handleImagePress = useCallback(
    async (attachment: ImageAttachmentItem) => {
      if (!item?.id) {
        return;
      }

      router.push({
        pathname: '/items/attachments/image-preview',
        params: {
          id: item.id,
          attachmentId: attachment.id,
        },
      });
    },
    [item?.id, router],
  );

  return (
    <View style={styles.container}>
      <ModalFlatList
        data={imageAttachments}
        keyExtractor={(attachment) => attachment.id}
        numColumns={IMAGE_GRID_COLUMNS}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({item: attachment}) => (
          <AttachmentImageTile
            attachment={attachment}
            onPress={handleImagePress}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="image-outline"
              message="No images available for this item yet."
            />
          </View>
        }
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
      listContent: {
        paddingTop: 0,
        paddingHorizontal: 0,
        paddingBottom: ds.spacing.xxl,
      },
      columnWrapper: {
        width: '100%',
        gap: 0,
      },
      emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: ds.spacing.xl,
        paddingVertical: ds.spacing.xl,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
