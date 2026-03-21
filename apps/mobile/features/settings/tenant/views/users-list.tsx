import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {Avatar, Divider, List, type ListItemProps} from 'react-native-paper';
import {ThemedText, EmptyState} from '@/components/ui';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {ListCountFooter, ListStatusHeader} from '@/features/shared';
import {usePullToRefresh} from '@/hooks';
import {useTheme} from '@/providers';
import {AppIcons, Icon, makeStyleFactory} from '@/utils';
import type {User} from '@sykamore/store';

type UsersListProps = {
  users: User[];
  onUserPress: (userId: string) => void;
  onRefresh?: () => Promise<void> | void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoading?: boolean;
  lastUpdated?: Date | null;
};

type UserItemProps = {
  item: User;
  onPress: (userId: string) => void;
  styles: ReturnType<typeof createStyles>;
};

const getUserInitials = (user: User): string => {
  const first = user.first_name?.[0]?.toUpperCase() ?? '';
  const last = user.last_name?.[0]?.toUpperCase() ?? '';
  if (first && last) return `${first}${last}`;
  if (first) return first;
  if (last) return last;
  return user.email?.[0]?.toUpperCase() ?? '?';
};

const renderChevron = () => (
  <Icon name={AppIcons.actions.forward} size="sm" colorToken="muted" />
);

const UserItem = memo<UserItemProps>(({item, onPress, styles}) => {
  const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);

  const name =
    `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim() || 'No name';

  const description = `${item.email}${
    item.role_name ? ` - ${item.role_name}` : ''
  }`;

  const initials = getUserInitials(item);

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
      style={styles.content}
      left={left}
      right={right}
      onPress={handlePress}
      title={
        <ThemedText variant="body" fontWeight="regular" ellipsizeMode="tail">
          {name}
        </ThemedText>
      }
      titleStyle={styles.title}
      description={
        <ThemedText variant="footnote" fontWeight="medium" colorToken="muted">
          {description}
        </ThemedText>
      }
      descriptionNumberOfLines={1}
      titleNumberOfLines={1}
      borderless
    />
  );
});
UserItem.displayName = 'UserItem';

export function UsersList({
  users,
  onUserPress,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.5,
  isLoading = false,
  lastUpdated = null,
}: UsersListProps) {
  const {ds, theme} = useTheme();
  const styles = useMemo(() => createStyles(ds, theme), [ds, theme]);

  const {
    refreshing,
    onRefresh: handleRefresh,
    refreshControl,
  } = usePullToRefresh({onRefresh});
  const fontScaleKey = ds.screen?.fontScale ?? 1;
  const userCount = users.length;

  const renderItem = useCallback(
    ({item}: {item: User}) => (
      <UserItem item={item} onPress={onUserPress} styles={styles} />
    ),
    [onUserPress, styles],
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

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
      <ListCountFooter
        count={userCount}
        dividerStyle={styles.divider}
        textVariant="callout"
        fontWeight="bold"
      />
    ),
    [userCount, styles.divider],
  );

  const ListEmpty = useCallback(
    () => (
      <EmptyState message="No Users Found" icon={AppIcons.emptyStates.user} />
    ),
    [],
  );

  const extraData = useMemo(
    () =>
      `${userCount}|${fontScaleKey}|${isLoading ? 1 : 0}|${
        lastUpdated ? lastUpdated.getTime() : 0
      }`,
    [userCount, fontScaleKey, isLoading, lastUpdated],
  );

  return (
    <FlashList
      key={`users-${fontScaleKey}`}
      data={users}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      extraData={extraData}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={userCount === 0 && !isLoading ? ListEmpty : null}
      ListFooterComponent={userCount > 0 ? ListFooter : undefined}
      contentInsetAdjustmentBehavior="automatic"
      maintainVisibleContentPosition={{disabled: true}}
      {...(refreshControl
        ? {refreshControl}
        : {refreshing, onRefresh: handleRefresh})}
      progressViewOffset={ds.spacing.lg}
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
