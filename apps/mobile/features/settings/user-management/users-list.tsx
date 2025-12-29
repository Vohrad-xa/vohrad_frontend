import React, {memo, useCallback, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {Avatar, Divider, List} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {usePullToRefresh} from '@/hooks';
import {useTheme} from '@/providers';
import {AppIcons, Icon, makeStyleFactory} from '@/utils';
import type {FlashListRef} from '@shopify/flash-list';
import type {User} from '@sykamore/store';

type UsersListProps = {
  users: User[];
  onUserPress: (userId: string) => void;
  onRefresh?: () => Promise<void> | void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  scrollToTopKey?: string;
};

type UserItemProps = {
  item: User;
  onPress: (userId: string) => void;
  styles: ReturnType<typeof createStyles>;
};

type PaperSideProps = {
  color: string;
  style?: StyleProp<ViewStyle>;
};

const getUserInitials = (user: User): string => {
  const first = user.first_name?.[0]?.toUpperCase() ?? '';
  const last = user.last_name?.[0]?.toUpperCase() ?? '';
  if (first && last) return `${first}${last}`;
  if (first) return first;
  if (last) return last;
  return user.email?.[0]?.toUpperCase() ?? '?';
};

const UserRightIcon = (props: PaperSideProps) => (
  <List.Icon
    {...props}
    icon={() => (
      <Icon name={AppIcons.ui.chevronRight} size="sm" colorToken="muted" />
    )}
  />
);

const UserItem = memo<UserItemProps>(({item, onPress, styles}) => {
  const handlePress = useCallback(() => onPress(item.id), [item.id, onPress]);

  const name =
    `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim() || 'No name';
  const description = `${item.email}${item.role ? ` - ${item.role}` : ''}`;
  const initials = getUserInitials(item);

  // Per-row renderer, memoized to avoid re-creating the function on every render.
  const left = useCallback(
    () => <Avatar.Text size={42} label={initials} />,
    [initials],
  );

  return (
    <List.Item
      style={styles.content}
      title={name}
      description={description}
      left={left}
      right={UserRightIcon}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      onPress={handlePress}
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
  scrollToTopKey,
}: UsersListProps) {
  const {ds, theme} = useTheme();
  const styles = useMemo(() => createStyles(ds, theme), [ds, theme]);
  const listRef = useRef<FlashListRef<User>>(null);
  const previousScrollKeyRef = useRef<string | null>(null);
  const {refreshing, onRefresh: handleRefresh} = usePullToRefresh({
    onRefresh,
  });

  useEffect(() => {
    if (!scrollToTopKey) return;
    if (
      previousScrollKeyRef.current &&
      previousScrollKeyRef.current !== scrollToTopKey
    ) {
      listRef.current?.scrollToOffset({offset: 0, animated: true});
    }
    previousScrollKeyRef.current = scrollToTopKey;
  }, [scrollToTopKey]);

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
    () => (
      <>
        <ThemedText variant="caption" style={styles.headerText}>
          {users.length === 1 ? '1 user found' : `${users.length} users found`}
        </ThemedText>
        <Divider style={styles.titleDivider} />
      </>
    ),
    [styles.headerText, styles.titleDivider, users.length],
  );

  return (
    <FlashList
      ref={listRef}
      data={users}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={ListHeader}
      contentInsetAdjustmentBehavior="automatic"
      refreshing={refreshing}
      onRefresh={handleRefresh}
      progressViewOffset={ds.spacing.lg}
    />
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      content: {
        paddingLeft: ds.spacing.lg + ds.spacing.xxs,
        paddingRight: ds.spacing.lg,
      },

      headerText: {
        paddingHorizontal: ds.spacing.lg,
      },

      title: {
        ...ds.typography.label,
        marginBottom: ds.spacing.xs,
      },

      description: {
        ...ds.typography.caption,
        color: theme.muted,
      },

      divider: {
        marginLeft: ds.spacing.xxl * 2 + ds.spacing.md,
        marginRight: ds.spacing.lg,
      },

      titleDivider: {
        marginTop: ds.spacing.md,
        marginHorizontal: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
