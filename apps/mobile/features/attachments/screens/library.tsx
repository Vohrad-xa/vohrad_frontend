import React, {useCallback} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
  FlatList,
  type ViewStyle,
} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {SelectableImageTile, useAttachmentImages} from '@/features/attachments';
import {IMAGE_GRID_COLUMNS, type ImageAttachmentItem} from '@/features/item';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

interface ImagesGridScreenProps {
  onImagePress: (attachment: ImageAttachmentItem) => void;
  isSelected: (attachment: ImageAttachmentItem) => boolean;
}

const keyExtractor = (item: ImageAttachmentItem) => item.id;
const getItemHeight = (screenWidth: number) => screenWidth / IMAGE_GRID_COLUMNS;

export function ImagesGridScreen({
  onImagePress,
  isSelected,
}: ImagesGridScreenProps) {
  const {theme, ds} = useTheme();
  const styles = useStyles(ds, theme);
  const {width} = useWindowDimensions();
  const {imageAttachments, loadMore, hasNext, isLoading} =
    useAttachmentImages();

  const handleLoadMore = useCallback(() => {
    if (hasNext && !isLoading) loadMore();
  }, [hasNext, isLoading, loadMore]);

  const renderItem = useCallback(
    ({item}: {item: ImageAttachmentItem}) => (
      <SelectableImageTile
        attachment={item}
        onPress={onImagePress}
        isSelected={isSelected(item)}
      />
    ),
    [onImagePress, isSelected],
  );

  // tells FlatList exact item dimensions
  const getItemLayout = useCallback(
    (
      _data: ArrayLike<ImageAttachmentItem> | null | undefined,
      index: number,
    ) => {
      const itemHeight = getItemHeight(width);
      const rowIndex = Math.floor(index / IMAGE_GRID_COLUMNS);
      return {
        length: itemHeight,
        offset: itemHeight * rowIndex,
        index,
      };
    },
    [width],
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <FlatList
          data={imageAttachments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          style={styles.flatList}
          contentContainerStyle={styles.webGrid}
          initialNumToRender={40}
          maxToRenderPerBatch={20}
          windowSize={5}
          removeClippedSubviews={false}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={imageAttachments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={IMAGE_GRID_COLUMNS}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        style={styles.flatList}
        columnWrapperStyle={styles.columnWrapper}
        getItemLayout={getItemLayout}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={11}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
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
      flatList: {
        flex: 1,
      },
      scrollView: {
        flex: 1,
      },
      columnWrapper: {
        width: '100%',
      },
      footerLoader: {
        padding: ds.spacing.lg,
        alignItems: 'center',
      },
      webGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 0,
        padding: 0,
        width: '100%',
      } as unknown as ViewStyle,
    }),
  (ds, theme) => themeKey(theme, ds),
);
