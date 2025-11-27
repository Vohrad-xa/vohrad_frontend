import {useEffect, useMemo, useState} from 'react';
import {
  buildUserSearchFilter,
  searchUsersLocally,
  useUsersListManager,
  type User,
} from '@vohrad/store';

type UseSearchUsersOptions = {
  searchQuery: string;
  pageSize?: number;
};

type UseHybridUserSearchOptions = {
  users: User[];
  searchQuery: string;
  onServerSearchNeeded: () => void;
  isUsingServerSearch: boolean;
};

function useUserServerSearchState(searchQuery: string) {
  const [shouldUseServerSearch, setShouldUseServerSearch] = useState(false);

  useEffect(() => {
    setShouldUseServerSearch(false);
  }, [searchQuery]);

  return {
    shouldUseServerSearch,
    enableServerSearch: () => setShouldUseServerSearch(true),
  };
}

function useHybridUserSearch({
  users,
  searchQuery,
  onServerSearchNeeded,
  isUsingServerSearch,
}: UseHybridUserSearchOptions) {
  const filteredUsers = useMemo(() => {
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

    if (!hasSearchQuery) {
      return users;
    }

    if (isUsingServerSearch) {
      return users;
    }

    return searchUsersLocally(users, searchQuery);
  }, [users, searchQuery, isUsingServerSearch]);

  useEffect(() => {
    const hasQuery = searchQuery && searchQuery.trim().length > 0;
    const hasUsersLoaded = users.length > 0;
    const localFoundNothing =
      hasQuery && !isUsingServerSearch && filteredUsers.length === 0;

    if (localFoundNothing && hasUsersLoaded) {
      onServerSearchNeeded();
    }
  }, [
    searchQuery,
    users.length,
    filteredUsers.length,
    onServerSearchNeeded,
    isUsingServerSearch,
  ]);

  return filteredUsers;
}

export function useSearchUsers(options: UseSearchUsersOptions) {
  const {searchQuery, pageSize} = options;
  const {shouldUseServerSearch, enableServerSearch} =
    useUserServerSearchState(searchQuery);

  const odataFilter = useMemo(() => {
    if (!shouldUseServerSearch) {
      return undefined;
    }
    return buildUserSearchFilter(searchQuery);
  }, [searchQuery, shouldUseServerSearch]);

  const manager = useUsersListManager({
    odataFilter,
    pageSize,
    enabled: shouldUseServerSearch ? Boolean(odataFilter) : true,
  });

  const users = useHybridUserSearch({
    users: manager.users,
    searchQuery,
    isUsingServerSearch: shouldUseServerSearch,
    onServerSearchNeeded: enableServerSearch,
  });

  return {
    ...manager,
    users,
    isUsingServerSearch: shouldUseServerSearch,
  };
}
