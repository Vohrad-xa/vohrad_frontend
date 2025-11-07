import React, {useCallback} from 'react';
import {Platform, Pressable, StyleSheet} from 'react-native';
import {Image} from 'expo-image';
import {SelectionOverlay} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import type {ImageAttachmentItem} from '@/features/item/detail/attachments/attachments-images';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

interface SelectableImageTileProps {
  attachment: ImageAttachmentItem;
  onPress: (attachment: ImageAttachmentItem) => void;
  isSelected: boolean;
  selectionMode: boolean;
  onToggleSelection?: (attachment: ImageAttachmentItem) => void;
}

export function SelectableImageTile({
  attachment,
  onPress,
  isSelected,
  selectionMode,
  onToggleSelection,
}: SelectableImageTileProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  const handlePress = useCallback(() => {
    if (Platform.OS === 'web') {
      onPress(attachment);
    } else if (selectionMode && onToggleSelection) {
      onToggleSelection(attachment);
    } else {
      onPress(attachment);
    }
  }, [attachment, onPress, selectionMode, onToggleSelection]);

  if (Platform.OS === 'web') {
    return (
      <Pressable
        onPress={handlePress}
        style={[
          styles.tile,
          isSelected ? styles.webSelected : styles.webNormal,
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          attachment.original_filename ?? 'View image attachment'
        }
        accessibilityState={{selected: isSelected}}
      >
        <Image
          source={{uri: attachment.resolvedUrl}}
          style={styles.image}
          contentFit="cover"
        />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.tile, selectionMode && styles.selectionTile]}
      accessibilityRole="button"
      accessibilityLabel={
        attachment.original_filename ?? 'View image attachment'
      }
    >
      <SelectionOverlay isSelected={isSelected} selectionMode={selectionMode}>
        <Image
          source={{uri: attachment.resolvedUrl}}
          style={styles.image}
          contentFit="cover"
        />
      </SelectionOverlay>
    </Pressable>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      tile: {
        flexBasis: `${100 / 4}%`,
        maxWidth: `${100 / 4}%`,
        flexShrink: 0,
        aspectRatio: 1,
        borderRadius: ds.borderRadius.sm,
      },
      selectionTile: {
        transform: [{scale: 0.98}],
      },
      image: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
      },
      webSelected: {
        borderWidth: ds.borderRadius.sm,
        borderColor: theme.accentOrange,
        opacity: 0.8,
      },
      webNormal: {
        borderWidth: ds.borderRadius.sm,
        borderColor: 'transparent',
        opacity: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
