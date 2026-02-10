import React, {useLayoutEffect, useState, useCallback} from 'react';
import {useNavigation} from 'expo-router';
import {UsersFilterMenu, UsersList} from '@/features/settings';
import {useSearch} from '@/providers';

export default function UsersScreen() {
  const navigation = useNavigation();
  const {searchQuery} = useSearch();
  const [filterControl, setFilterControl] = useState<React.ReactNode>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <>{filterControl}</>,
    });
  }, [filterControl, navigation]);

  const handleUserPress = useCallback((_userId: string) => {
    // TODO: Navigate to user detail when ready
  }, []);

  return (
    <UsersFilterMenu
      searchQuery={searchQuery}
      onFilterControlChange={setFilterControl}
    >
      {({users, refresh, hasNext, onEndReached, isLoading, lastUpdated}) => (
        <UsersList
          users={users}
          onUserPress={handleUserPress}
          onRefresh={refresh}
          onEndReached={hasNext ? onEndReached : undefined}
          onEndReachedThreshold={0.4}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />
      )}
    </UsersFilterMenu>
  );
}
