import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {Avatar, Divider, List, type ListItemProps} from 'react-native-paper';
import {EmptyState} from '@/components/ui';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {ListCountFooter, ListStatusHeader} from '@/features/shared';
import {usePullToRefresh} from '@/hooks';
import {useTheme} from '@/providers';
import {AppIcons, Icon, makeStyleFactory} from '@/utils';
import type {Location} from '@sykamore/store';

type LocationsListProps = {
  locations: Location[];
  onLocationPress: (locationId: string) => void;
  onRefresh?: () => Promise<void> | void;
  onEndReached?: () => void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
};

type LocationItemProps = {
  item: Location;
  onPress: (locationId: string) => void;
  styles: ReturnType<typeof createStyles>;
};

const getLocationInitials = (name: string): string =>
  name.trim().substring(0, 2).toUpperCase() || '?';

const renderChevron = () => (
  <Icon name={AppIcons.actions.forward} size="sm" colorToken="muted" />
);

const LocationItem = memo<LocationItemProps>(({item, onPress, styles}) => {
  const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);

  const initials = getLocationInitials(item.name || '?');
  const title = item.name || 'No name';
  const description = item.code;

  const left = useCallback<NonNullable<ListItemProps['left']>>(
    ({style}) => (
      <Avatar.Text
        label={initials}
        style={style}
        color={Palette.deepblue}
        size={45}
      />
    ),
    [initials],
  );

  const right = useCallback<NonNullable<ListItemProps['right']>>(
    (props) => <List.Icon {...props} icon={renderChevron} />,
    [],
  );

  return (
    <List.Item
      title={title}
      description={description}
      onPress={handlePress}
      titleStyle={styles.title}
      style={styles.content}
      left={left}
      right={right}
      unstable_pressDelay={30}
      descriptionNumberOfLines={1}
      titleNumberOfLines={1}
      borderless
    />
  );
});
LocationItem.displayName = 'LocationItem';

export function LocationsList({
  locations,
  onLocationPress,
  onRefresh,
  onEndReached,
  isLoading = false,
  lastUpdated = null,
}: LocationsListProps) {
  const {ds, theme} = useTheme();
  const styles = useMemo(() => createStyles(ds, theme), [ds, theme]);

  const {refreshing, onRefresh: handleRefresh} = usePullToRefresh({onRefresh});
  const fontScaleKey = ds.screen?.fontScale ?? 1;
  const locationCount = locations.length;

  const renderItem = useCallback(
    ({item}: {item: Location}) => (
      <LocationItem item={item} onPress={onLocationPress} styles={styles} />
    ),
    [onLocationPress, styles],
  );

  const keyExtractor = useCallback((item: Location) => item.id, []);

  const ItemSeparator = useCallback(
    () => <Divider style={styles.divider} />,
    [styles.divider],
  );

  const ListHeader = useCallback(
    () => <ListStatusHeader isLoading={isLoading} lastUpdated={lastUpdated} />,
    [isLoading, lastUpdated],
  );

  const ListFooter = useCallback(
    () => (
      <ListCountFooter count={locationCount} dividerStyle={styles.divider} />
    ),
    [locationCount, styles.divider],
  );

  const ListEmpty = useCallback(
    () => (
      <EmptyState
        message="No Locations Found"
        icon={AppIcons.emptyStates.file}
      />
    ),
    [],
  );

  const extraData = useMemo(
    () => `${locationCount}|${fontScaleKey}`,
    [locationCount, fontScaleKey],
  );

  return (
    <FlashList
      key={`locations-${fontScaleKey}`}
      data={locations}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      extraData={extraData}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={locationCount === 0 && !isLoading ? ListEmpty : null}
      ListFooterComponent={locationCount > 0 ? ListFooter : undefined}
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
        paddingLeft: ds.spacing.xxs,
        paddingRight: ds.spacing.lg,
      },
      title: {
        marginBottom: ds.spacing.xs,
      },
      divider: {
        marginLeft: ds.spacing.xxl * 2 + ds.spacing.lg,
        marginRight: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
