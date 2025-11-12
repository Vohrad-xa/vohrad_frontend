import React, {memo} from 'react';
import {Platform, Pressable, View, useWindowDimensions} from 'react-native';
import {Image} from 'expo-image';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  IMAGE_GRID_COLUMNS,
  type ImageAttachmentItem,
} from '@/features/attachments/screens/attachments-images';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

interface SelectableImageTileProps {
  attachment: ImageAttachmentItem;
  onPress: (attachment: ImageAttachmentItem) => void;
  isSelected: boolean;
}

export const SelectableImageTile = memo(
  ({attachment, onPress, isSelected}: SelectableImageTileProps) => {
    const {theme, ds} = useTheme();
    const {width} = useWindowDimensions();
    const styles = useStyles(ds, theme, width);

    return (
      <Pressable
        onPress={() => onPress(attachment)}
        style={styles.tile}
        accessibilityRole="button"
        accessibilityLabel={
          attachment.original_filename ?? 'View image attachment'
        }
        accessibilityState={{selected: isSelected}}
      >
        <Image
          source={{uri: attachment.thumbnailUrl ?? attachment.resolvedUrl}}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={attachment.id}
          transition={200}
          priority="normal"
        />
        {isSelected && <View style={styles.overlay} />}
      </Pressable>
    );
  },
);

SelectableImageTile.displayName = 'SelectableImageTile';

const useStyles = makeStyleFactory(
  (_ds: DSShape, theme: ThemeShape, width: number) => ({
    tile: Platform.select({
      web: {
        width: '100%',
        aspectRatio: 1,
      },
      default: {
        width: width / IMAGE_GRID_COLUMNS,
        height: width / IMAGE_GRID_COLUMNS,
      },
    }),
    image: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.5,
      backgroundColor: theme.accentBlue,
      pointerEvents: 'none',
    },
  }),
  (ds, theme, width) => `${themeKey(theme, ds)}|${width}`,
);
