import {memo} from 'react';
import {Pressable, useWindowDimensions} from 'react-native';
import {Image} from 'expo-image';
import {Checkbox} from 'react-native-paper';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import {IMAGE_GRID_COLUMNS, type ImageAttachmentItem} from '../hooks';

interface SelectableImageTileProps {
  attachment: ImageAttachmentItem;
  onPress: (attachment: ImageAttachmentItem) => void;
  onLongPress?: (attachment: ImageAttachmentItem) => void;
  isSelected: boolean;
  selectionVisible: boolean;
}

export const SelectableImageTile = memo(
  ({
    attachment,
    onPress,
    onLongPress,
    isSelected,
    selectionVisible,
  }: SelectableImageTileProps) => {
    const {theme, ds} = useTheme();
    const {width} = useWindowDimensions();
    const styles = useStyles(ds, theme, width);

    return (
      <Pressable
        onPress={() => onPress(attachment)}
        onLongPress={onLongPress ? () => onLongPress(attachment) : undefined}
        style={[styles.tile, styles.tileContent]}
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
        {selectionVisible ? (
          <Checkbox.Android
            status={isSelected ? 'checked' : 'unchecked'}
            color={theme.accentBlue}
            onPress={() => onPress(attachment)}
            rippleColor={theme.ripple}
            cancelable
          />
        ) : null}
      </Pressable>
    );
  },
);

SelectableImageTile.displayName = 'SelectableImageTile';

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape, width: number) => ({
    tile: {
      width: width / IMAGE_GRID_COLUMNS,
      height: width / IMAGE_GRID_COLUMNS,
    },
    tileContent: {
      position: 'relative',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      padding: ds.spacing.xxs,
    },
    image: {
      position: 'absolute',
      top: 1,
      right: 1,
      bottom: 1,
      left: 1,
      borderRadius: 2,
    },
  }),
  (ds, theme, width) => `${themeKey(theme, ds)}|${width}`,
);
