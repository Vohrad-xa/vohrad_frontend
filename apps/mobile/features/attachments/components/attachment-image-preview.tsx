import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Image} from 'expo-image';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import type {ImageAttachmentItem} from '@/features/attachments/hooks/attachment-images';
import {useTheme} from '@/providers';
import {AppIcons, Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';

type AttachmentImagePreviewProps = {
  attachments: ImageAttachmentItem[];
  initialAttachmentId?: string;
};

export function AttachmentImagePreview({
  attachments,
  initialAttachmentId,
}: AttachmentImagePreviewProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  const initialIndex = useMemo(() => {
    if (!initialAttachmentId) {
      return 0;
    }
    const idx = attachments.findIndex(
      (item) => item.id === initialAttachmentId,
    );
    return idx >= 0 ? idx : 0;
  }, [attachments, initialAttachmentId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < attachments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, attachments.length]);

  if (!attachments.length) {
    return null;
  }

  const currentAttachment = attachments[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          key={currentAttachment.id}
          source={{uri: currentAttachment.resolvedUrl}}
          style={styles.image}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </View>
      {attachments.length > 1 && (
        <>
          <Pressable
            style={[styles.arrowButton, styles.leftArrow]}
            onPress={goToPrevious}
            accessibilityRole="button"
            accessibilityLabel="Previous image"
            disabled={currentIndex === 0}
          >
            <Icon
              name={AppIcons.ui.chevronLeft}
              size="xxl"
              colorToken={currentIndex === 0 ? 'muted' : 'accentBlue'}
            />
          </Pressable>
          <Pressable
            style={[styles.arrowButton, styles.rightArrow]}
            onPress={goToNext}
            accessibilityRole="button"
            accessibilityLabel="Next image"
            disabled={currentIndex === attachments.length - 1}
          >
            <Icon
              name={AppIcons.ui.chevronRight}
              size="xxl"
              colorToken={
                currentIndex === attachments.length - 1 ? 'muted' : 'accentBlue'
              }
            />
          </Pressable>
        </>
      )}
    </View>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      image: {
        width: '100%',
        height: '100%',
      },
      arrowButton: {
        position: 'absolute',
        top: '50%',
        transform: [{translateY: -ds.spacing.xl}],
      },
      leftArrow: {
        left: ds.spacing.md,
      },
      rightArrow: {
        right: ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
