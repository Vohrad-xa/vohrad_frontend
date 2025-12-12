import React, {useLayoutEffect, useState, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRouter} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useSearch} from '@/features/dashboard';
import {UsersFilterMenu, UsersList} from '@/features/settings/organization';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';

export default function UsersScreen() {
  const {ds, theme} = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const styles = createStyles(ds, theme);
  const {searchQuery} = useSearch();
  const [filterControl, setFilterControl] = useState<React.ReactNode>(null);

  const handleAddUser = useCallback(() => {
    router.push('/settings/organization/add-user');
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtonGroup}>
          {filterControl}
          <HeaderButton
            icon={AppIcons.actions.addUser}
            onPress={handleAddUser}
            accessibilityLabel="Add user"
          />
        </View>
      ),
    });
  }, [filterControl, navigation, styles.headerButtonGroup, handleAddUser]);

  const handleUserPress = useCallback((_userId: string) => {
    // TODO: Navigate to user detail when ready
  }, []);

  return (
    <UsersFilterMenu
      searchQuery={searchQuery}
      onFilterControlChange={setFilterControl}
    >
      {({users, refresh, hasNext, onEndReached}) => (
        <UsersList
          users={users}
          onUserPress={handleUserPress}
          onRefresh={refresh}
          onEndReached={hasNext ? onEndReached : undefined}
          onEndReachedThreshold={0.4}
        />
      )}
    </UsersFilterMenu>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      headerButtonGroup: {
        flexDirection: 'row',
        gap: ds.spacing.xs,
        paddingHorizontal: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
