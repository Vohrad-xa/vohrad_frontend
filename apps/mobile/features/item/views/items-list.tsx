import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {Avatar, Divider, List, type ListItemProps} from 'react-native-paper';
import {EmptyState} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {ListCountFooter, ListStatusHeader} from '@/features/shared';
import {usePullToRefresh} from '@/hooks';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';
import type {Item} from '@sykamore/types';

type ItemsListProps = {
  items: Item[];
  onItemPress: (itemId: string) => void;
  onRefresh?: () => Promise<void> | void;
  onEndReached?: () => void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  getItemImageUrl?: (item: Item) => {uri: string} | undefined;
};

type ItemItemProps = {
  item: Item;
  onPress: (itemId: string) => void;
  styles: ReturnType<typeof createStyles>;
  getItemImageUrl?: (item: Item) => {uri: string} | undefined;
};

const ItemItem = memo<ItemItemProps>(
  ({item, onPress, styles, getItemImageUrl}) => {
    const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);

    const name = item.name || 'No name';
    const description = `${item.sku ?? 'No SKU'}${item.price ? ` - $${item.price}` : ''}`;
    const imageUrl = getItemImageUrl?.(item);

    const left = useCallback<NonNullable<ListItemProps['left']>>(
      ({style}) =>
        imageUrl ? (
          <Avatar.Image size={45} source={imageUrl} style={style} />
        ) : (
          <Avatar.Icon size={45} icon={AppIcons.domain.item} style={style} />
        ),
      [imageUrl],
    );

    return (
      <List.Item
        title={name}
        description={description}
        onPress={handlePress}
        titleStyle={styles.title}
        style={styles.content}
        left={left}
        right={(props) => (
          <List.Icon {...props} icon={AppIcons.actions.forward} />
        )}
        borderless
      />
    );
  },
);
ItemItem.displayName = 'ItemItem';

export function ItemsList({
  items,
  onItemPress,
  onRefresh,
  onEndReached,
  isLoading = false,
  lastUpdated = null,
  getItemImageUrl,
}: ItemsListProps) {
  const {ds, theme} = useTheme();
  const styles = useMemo(() => createStyles(ds, theme), [ds, theme]);

  const {refreshing, onRefresh: handleRefresh} = usePullToRefresh({onRefresh});
  const fontScaleKey = ds.screen?.fontScale ?? 1;
  const itemCount = items.length;

  const renderItem = useCallback(
    ({item}: {item: Item}) => (
      <ItemItem
        item={item}
        onPress={onItemPress}
        styles={styles}
        getItemImageUrl={getItemImageUrl}
      />
    ),
    [onItemPress, styles, getItemImageUrl],
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  const ItemSeparator = useCallback(
    () => <Divider style={styles.divider} />,
    [styles.divider],
  );

  const ListHeader = useCallback(
    () => <ListStatusHeader isLoading={isLoading} lastUpdated={lastUpdated} />,
    [isLoading, lastUpdated],
  );

  const ListFooter = useCallback(
    () => <ListCountFooter count={itemCount} dividerStyle={styles.divider} />,
    [itemCount, styles.divider],
  );

  const ListEmpty = useCallback(
    () => (
      <EmptyState message="No Items Found" icon={AppIcons.emptyStates.file} />
    ),
    [],
  );

  const extraData = useMemo(
    () => `${itemCount}|${fontScaleKey}`,
    [itemCount, fontScaleKey],
  );

  return (
    <FlashList
      key={`items-${fontScaleKey}`}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      extraData={extraData}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={itemCount === 0 && !isLoading ? ListEmpty : null}
      ListFooterComponent={itemCount > 0 ? ListFooter : undefined}
      contentInsetAdjustmentBehavior="automatic"
      maintainVisibleContentPosition={{disabled: true}}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      content: {
        paddingRight: ds.spacing.md,
      },
      title: {
        marginBottom: ds.spacing.xs,
      },
      divider: {
        marginLeft: ds.spacing.xxl * 2 + ds.spacing.md,
        marginRight: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
