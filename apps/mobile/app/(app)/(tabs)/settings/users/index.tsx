import React, {useLayoutEffect, useState, useCallback} from 'react';
import {useNavigation, useRouter} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useSearch} from '@/features/dashboard';
import {UsersFilterMenu, UsersList} from '@/features/settings';
import {AppIcons} from '@/utils';

export default function UsersScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const {searchQuery} = useSearch();
  const [filterControl, setFilterControl] = useState<React.ReactNode>(null);

  const handleAddUser = useCallback(() => {
    router.push('/settings/users/add-user');
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <HeaderButton
            icon={AppIcons.actions.addUser}
            onPress={handleAddUser}
            accessibilityLabel="Add user"
          />
          {filterControl}
        </>
      ),
    });
  }, [filterControl, navigation, handleAddUser]);

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
