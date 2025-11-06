import React, {useMemo} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useImageAttachments} from '@/features/item/detail/attachments/attachments-images';
import {useItemAttachments} from '@/features/item/detail/attachments/use-item-attachments';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ItemAttachmentImagePreviewModal() {
  const params = useLocalSearchParams<{attachmentId?: string}>();
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);
  const {attachments, item} = useItemAttachments();
  const imageAttachments = useImageAttachments(attachments);

  const attachment = useMemo(
    () =>
      imageAttachments.find(
        (img) =>
          img.id ===
          (typeof params.attachmentId === 'string' ? params.attachmentId : ''),
      ),
    [imageAttachments, params.attachmentId],
  );

  if (!item || !attachment) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={{uri: attachment.resolvedUrl}}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      imageWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: ds.spacing.xl,
        paddingVertical: ds.spacing.xl,
      },
      image: {
        width: '100%',
        height: '100%',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
