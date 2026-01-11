import {useCallback, useMemo} from 'react';
import {useWindowDimensions} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {ListCountFooter} from '@/features/shared';
import {usePullToRefresh} from '@/hooks';
import {SelectableImageTile} from '../components';
import {IMAGE_GRID_COLUMNS, type ImageAttachmentItem} from '../hooks';

interface ImagesGridScreenProps {
  imageAttachments: ImageAttachmentItem[];
  loadMore: () => void;
  hasNext?: boolean;
  isLoading: boolean;
  refresh?: () => void | Promise<void>;
  onImagePress: (attachment: ImageAttachmentItem) => void;
  isSelected: (attachment: ImageAttachmentItem) => boolean;
}

const keyExtractor = (item: ImageAttachmentItem) => item.id;

export function ImagesGridScreen({
  imageAttachments,
  loadMore,
  hasNext,
  isLoading,
  refresh,
  onImagePress,
  isSelected,
}: ImagesGridScreenProps) {
  const {width, height} = useWindowDimensions();
  const {refreshing, onRefresh: handleRefresh} = usePullToRefresh({
    onRefresh: refresh,
  });

  const drawDistance = useMemo(() => Math.round(height * 1.2), [height]);

  const extraData = useMemo(() => [isSelected, width], [isSelected, width]);

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

  const getItemType = useCallback(() => 'image', []);

  const listFooter = useMemo(
    () =>
      imageAttachments.length > 0 ? (
        <ListCountFooter
          count={imageAttachments.length}
          textVariant="callout"
          fontWeight="bold"
        />
      ) : null,
    [imageAttachments.length],
  );

  return (
    <FlashList
      data={imageAttachments}
      extraData={extraData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={IMAGE_GRID_COLUMNS}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      drawDistance={drawDistance}
      getItemType={getItemType}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      removeClippedSubviews
      ListFooterComponent={listFooter}
      showsVerticalScrollIndicator={false}
    />
  );
}
