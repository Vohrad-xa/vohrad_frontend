import React, {useCallback, useMemo} from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {filterAttachmentsByKind} from './use-item-attachments';
import type {ItemAttachment} from '@vohrad/types';

export const IMAGE_GRID_COLUMNS = 4;

const useStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      tile: {
        flexBasis: `${100 / IMAGE_GRID_COLUMNS}%`,
        maxWidth: `${100 / IMAGE_GRID_COLUMNS}%`,
        flexShrink: 0,
        aspectRatio: 1,
      },
      image: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.surface,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

export interface ImageAttachmentItem extends ItemAttachment {
  resolvedUrl: string;
}

export function useImageAttachments(
  attachments?: ItemAttachment[] | null,
): ImageAttachmentItem[] {
  return useMemo(() => {
    return filterAttachmentsByKind(attachments, 'image')
      .map((attachment) => {
        const rawUrl = attachment.download_url ?? attachment.file_path ?? null;
        if (!rawUrl) {
          return null;
        }

        const resolvedUrl = rawUrl.startsWith('http')
          ? rawUrl
          : resolveAttachmentUrl(rawUrl);

        return {...attachment, resolvedUrl};
      })
      .filter(
        (attachment): attachment is ImageAttachmentItem => attachment !== null,
      );
  }, [attachments]);
}

interface AttachmentImageTileProps {
  attachment: ImageAttachmentItem;
  onPress: (attachment: ImageAttachmentItem) => void;
}

export function AttachmentImageTile({
  attachment,
  onPress,
}: AttachmentImageTileProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  const handlePress = useCallback(() => {
    onPress(attachment);
  }, [attachment, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.tile}
      accessibilityRole="button"
      accessibilityLabel={
        attachment.original_filename ?? 'View image attachment'
      }
    >
      <Image
        source={{uri: attachment.resolvedUrl}}
        style={styles.image}
        resizeMode="cover"
      />
    </Pressable>
  );
}
