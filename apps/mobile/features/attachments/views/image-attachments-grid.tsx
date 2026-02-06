import {useCallback, useMemo} from 'react';
import {useWindowDimensions} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {EmptyState} from '@/components/ui';
import {ListCountFooter} from '@/features/shared';
import {usePullToRefresh} from '@/hooks';
import {useHaptic} from '@/providers';
import {AppIcons} from '@/utils';
import {SelectableImageTile} from '../components/selectable-image-tile';
import {
  IMAGE_GRID_COLUMNS,
  type ImageAttachmentItem,
  type AttachmentsSelectionController,
} from '../hooks';

interface ImageAttachmentsGridProps {
  attachments: ImageAttachmentItem[];
  loadMore: () => void;
  hasNext?: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  refresh?: () => void | Promise<void>;
  onImagePress: (attachment: ImageAttachmentItem) => void;
  selection: AttachmentsSelectionController<ImageAttachmentItem>;
}

const keyExtractor = (item: ImageAttachmentItem) => item.id;

export function ImageAttachmentsGrid({
  attachments,
  loadMore,
  hasNext,
  isLoading,
  isFetchingNextPage,
  refresh,
  onImagePress,
  selection,
}: ImageAttachmentsGridProps) {
  const {width, height} = useWindowDimensions();
  const {refreshing, onRefresh: handleRefresh} = usePullToRefresh({
    onRefresh: refresh,
  });
  const {triggerHaptic} = useHaptic();

  const drawDistance = useMemo(() => Math.round(height * 1.2), [height]);

  const extraData = useMemo(
    () =>
      `${selection.selectionVersion}|${selection.isSelectionMode ? 1 : 0}|${width}`,
    [selection.selectionVersion, selection.isSelectionMode, width],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNext && !isFetchingNextPage) loadMore();
  }, [hasNext, isFetchingNextPage, loadMore]);

  const handlePress = useCallback(
    async (attachment: ImageAttachmentItem) => {
      if (selection.isSelectionMode) {
        triggerHaptic('light');
        selection.toggleSelection(attachment.id);
        return;
      }
      await onImagePress(attachment);
    },
    [selection, triggerHaptic, onImagePress],
  );

  const handleLongPress = useCallback(
    (attachment: ImageAttachmentItem) => {
      selection.enableSelectionMode();
      triggerHaptic('light');
      selection.toggleSelection(attachment.id);
    },
    [selection, triggerHaptic],
  );

  const renderItem = useCallback(
    ({item}: {item: ImageAttachmentItem}) => (
      <SelectableImageTile
        attachment={item}
        onPress={handlePress}
        onLongPress={handleLongPress}
        isSelected={selection.isSelected(item.id)}
        selectionVisible={selection.isSelectionMode}
      />
    ),
    [handlePress, handleLongPress, selection],
  );

  const getItemType = useCallback(() => 'image', []);

  const ListEmpty = useCallback(
    () => (
      <EmptyState message="No Records Found" icon={AppIcons.emptyStates.file} />
    ),
    [],
  );

  return (
    <FlashList
      data={attachments}
      extraData={extraData}
      renderItem={renderItem}
      numColumns={IMAGE_GRID_COLUMNS}
      keyExtractor={keyExtractor}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      drawDistance={drawDistance}
      getItemType={getItemType}
      removeClippedSubviews
      maintainVisibleContentPosition={{disabled: true}}
      ListEmptyComponent={
        attachments.length === 0 && !isLoading ? ListEmpty : undefined
      }
    />
  );
}
