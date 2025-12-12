import React, {useCallback} from 'react';
import {FlatList, Platform, StyleSheet} from 'react-native';
import {List, Divider} from 'react-native-paper';
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

const renderLeftIcon = () => (
  <Icon name={AppIcons.navigation.profile} colorToken="icon" size="lg" />
);
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

      return (
        <List.Item
          style={styles.list}
          containerStyle={styles.item}
          title={userName}
          description={description}
          left={renderLeftIcon}
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
      data={users}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onRefresh={onRefresh}
      refreshing={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      ListHeaderComponent={
        <>
          <ThemedText variant="secondary">List of Users</ThemedText>
          <Divider style={styles.titleDivider} />
        </>
      }
      ListHeaderComponentStyle={{
        paddingHorizontal: ds.spacing.lg,
        paddingTop: ds.spacing.lg,
      }}
    />
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      list: {
        paddingRight: ds.spacing.lg,
        paddingLeft: ds.spacing.lg,
      },
      item: {
        alignItems: 'center',
      },
      title: {
        color: theme.text,
        fontSize: ds.typography.value.fontSize,
        marginBottom: ds.spacing.xs,
      },
      description: {
        color: theme.muted,
        fontSize: ds.typography.caption2.fontSize,
      },
      divider: {
        marginLeft: ds.spacing.xxxl + ds.spacing.sm,
        marginRight: ds.spacing.lg,
      },

      titleDivider: {
        marginTop: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
