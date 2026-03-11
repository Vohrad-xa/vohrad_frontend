import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {Image} from 'expo-image';
import {Divider, List, type ListItemProps} from 'react-native-paper';
import {EmptyState} from '@/components/ui';
import {
  Palette,
  themeKey,
  type DSShape,
  type ThemeShape,
  useTypography,
} from '@/constants';
import {ListCountFooter, ListStatusHeader} from '@/features/shared';
import {usePullToRefresh} from '@/hooks';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory, Icon} from '@/utils';
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
    const typography = useTypography();

    const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);

    const name = item.name || 'No name';
    const description = `${item.sku ?? 'No SKU'}${item.price ? ` - $${item.price}` : ''}`;
    const imageUrl = getItemImageUrl?.(item);

    const left = useCallback<NonNullable<ListItemProps['left']>>(
      ({style}) =>
        imageUrl ? (
          <Image
            source={imageUrl}
            recyclingKey={item.id}
            cachePolicy="memory-disk"
            contentFit="cover"
            style={[styles.avatar, style]}
          />
        ) : (
          <View style={[styles.iconContainer, style]}>
            <Icon
              name={AppIcons.domain.itemOutline}
              color={Palette.deepblue}
              size="lg"
            />
          </View>
        ),
      [imageUrl, item.id, styles.avatar, styles.iconContainer],
    );

    return (
      <List.Item
        title={name}
        description={description}
        onPress={handlePress}
        titleStyle={styles.title}
        left={left}
        unstable_pressDelay={30}
        descriptionNumberOfLines={1}
        titleNumberOfLines={1}
        descriptionStyle={[typography.footnote, {color: Palette.gray[600]}]}
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
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      title: {
        marginBottom: ds.spacing.sm,
      },
      divider: {
        marginLeft: ds.spacing.xxl * 2 + ds.spacing.md,
        marginRight: ds.spacing.lg,
      },
      avatar: {
        width: 45,
        height: 45,
        borderRadius: ds.borderRadius.full,
      },
      iconContainer: {
        width: 45,
        height: 45,
        borderRadius: ds.borderRadius.full,
        backgroundColor: theme.primary,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
