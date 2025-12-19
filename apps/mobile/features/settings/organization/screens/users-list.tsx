import React, {useCallback} from 'react';
import {FlatList, StyleSheet, Platform} from 'react-native';
import {List, Divider, Avatar} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory, AppIcons, Icon} from '@/utils';
import type {User} from '@vohrad/store';

type UsersListProps = {
  users: User[];
  onUserPress: (userId: string) => void;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
};

const getUserInitials = (user: User): string => {
  const firstInitial = user.first_name?.[0]?.toUpperCase() ?? '';
  const lastInitial = user.last_name?.[0]?.toUpperCase() ?? '';

  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`;
  }
  if (firstInitial) {
    return firstInitial;
  }
  if (lastInitial) {
    return lastInitial;
  }
  return user.email?.[0]?.toUpperCase() ?? '?';
};

const renderRightIcon = () => (
  <Icon name={AppIcons.navigation.chevronRight} colorToken="muted" size="sm" />
);

export function UsersList({
  users,
  onUserPress,
  onRefresh,
  onEndReached,
  onEndReachedThreshold,
}: UsersListProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const renderItem = useCallback(
    ({item}: {item: User; index: number}) => {
      const userName =
        `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim() || 'No name';
      const description = `${item.email}${item.role ? ` • ${item.role}` : ''}`;
      const initials = getUserInitials(item);

      return (
        <List.Item
          style={styles.list}
          containerStyle={styles.item}
          title={userName}
          description={description}
          left={() => (
            <Avatar.Text size={40} style={styles.avatar} label={initials} />
          )}
          right={renderRightIcon}
          titleStyle={styles.title}
          descriptionStyle={styles.description}
          onPress={() => onUserPress(item.id)}
        />
      );
    },
    [onUserPress, styles],
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

  return (
    <FlatList
      style={styles.flatList}
      data={users}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onRefresh={onRefresh}
      refreshing={false}
      onEndReached={onEndReached}
      contentInsetAdjustmentBehavior="automatic"
      onEndReachedThreshold={onEndReachedThreshold}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      ListHeaderComponent={
        <>
          <ThemedText variant="secondary">Users can be managed here</ThemedText>
          <Divider style={styles.titleDivider} />
        </>
      }
      ListHeaderComponentStyle={{
        paddingHorizontal: ds.spacing.lg,
        paddingTop: Platform.OS !== 'ios' ? ds.spacing.lg : 0,
      }}
    />
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      list: {
        paddingRight: ds.spacing.lg,
        paddingLeft: ds.spacing.lg + 2,
      },
      item: {
        alignItems: 'center',
      },
      flatList: {
        borderRadius: ds.spacing.xxl,
      },
      title: {
        color: theme.text,
        fontSize: ds.typography.label.fontSize,
        marginBottom: ds.spacing.xs,
      },
      description: {
        color: theme.muted,
        fontSize: ds.typography.caption.fontSize,
      },
      divider: {
        marginLeft: ds.spacing.xxl * 2 + ds.spacing.sm,
        marginRight: ds.spacing.lg,
      },

      titleDivider: {
        marginTop: ds.spacing.lg,
      },
      avatar: {
        backgroundColor: theme.secondary,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
