import React, {useCallback} from 'react';
import {UsersFilterMenu, UsersList} from '@/features/settings';
import {useSearch} from '@/providers';

export default function UsersScreen() {
  const {searchQuery} = useSearch();
  const handleUserPress = useCallback((_userId: string) => {
    // TODO: Navigate to user detail when ready
  }, []);

  return (
    <UsersFilterMenu searchQuery={searchQuery}>
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
