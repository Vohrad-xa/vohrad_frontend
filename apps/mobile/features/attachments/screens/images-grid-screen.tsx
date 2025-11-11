import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';
import {FlatList} from 'react-native';
import {SelectableImageTile, useAttachmentImages} from '@/features/attachments';
import {IMAGE_GRID_COLUMNS, type ImageAttachmentItem} from '@/features/item';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

interface ImagesGridScreenProps {
  onImagePress: (attachment: ImageAttachmentItem) => void;
  isSelected: (attachment: ImageAttachmentItem) => boolean;
}

const keyExtractor = (item: ImageAttachmentItem) => item.id;

export function ImagesGridScreen({
  onImagePress,
  isSelected,
}: ImagesGridScreenProps) {
  const {theme, ds} = useTheme();
  const styles = useStyles(ds, theme);
  const {imageAttachments, loadMore, hasNext, isLoading} =
    useAttachmentImages();

  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const [displayData, setDisplayData] = useState<ImageAttachmentItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false);
      setDisplayData(imageAttachments);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showInitialLoading) {
      setDisplayData(imageAttachments);
    }
  }, [imageAttachments, showInitialLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasNext) loadMore();
  }, [hasNext, loadMore]);

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

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.webGrid}
        >
          {displayData.map((attachment) => (
            <SelectableImageTile
              key={attachment.id}
              attachment={attachment}
              onPress={onImagePress}
              isSelected={isSelected(attachment)}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={IMAGE_GRID_COLUMNS}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        style={styles.flatList}
        columnWrapperStyle={styles.columnWrapper}
        initialNumToRender={16}
        maxToRenderPerBatch={8}
        windowSize={21}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        ListFooterComponent={
          <View style={styles.footerLoader}>
            {showInitialLoading && <ActivityIndicator size="small" />}
          </View>
        }
      />
    </View>
  );
}

const useStyles = makeStyleFactory(
  (_ds: DSShape, theme: ThemeShape) =>
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
        padding: 16,
        alignItems: 'center',
      },
      webGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 0,
        padding: 0,
        width: '100%',
      } as any,
    }),
  (ds, theme) => themeKey(theme, ds),
);
