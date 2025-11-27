import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {ListRow, Divider, type ListRowData} from '@/components/ui';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory, AppIcons, Icon} from '@/utils';
import type {User} from '@vohrad/store';

type UsersListProps = {
  users: User[];
  onUserPress: (userId: string) => void;
};

export function UsersList({users, onUserPress}: UsersListProps) {
  const {ds} = useTheme();
  const styles = createStyles(ds);

  const transformUserToListRow = useCallback(
    (user: User): ListRowData => ({
      id: user.id,
      name:
        `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'No name',
      code: `${user.email}${user.role ? ` • ${user.role}` : ''}`,
      onPress: () => onUserPress(user.id),
    }),
    [onUserPress],
  );

  const listData = useMemo(
    () => users.map(transformUserToListRow),
    [users, transformUserToListRow],
  );

  const userIcon = useMemo(
    () => (
      <View style={styles.iconContainer}>
        <Icon name={AppIcons.business.profile} size="xl" />
      </View>
    ),
    [styles.iconContainer],
  );

  const renderItem = useCallback(
    ({item, index}: {item: ListRowData; index: number}) => (
      <View>
        <ListRow item={item} customLeftIcon={userIcon} />
        {index < listData.length - 1 && (
          <View style={styles.dividerContainer}>
            <Divider />
          </View>
        )}
      </View>
    ),
    [listData.length, styles, userIcon],
  );

  return {
    listData,
    renderItem,
  };
}

const createStyles = makeStyleFactory(
  (ds: DSShape) =>
    StyleSheet.create({
      dividerContainer: {
        paddingLeft: ds.spacing.xxl + ds.spacing.sm,
      },
      iconContainer: {
        borderRadius: ds.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  (ds) => `${ds.version}`,
);
