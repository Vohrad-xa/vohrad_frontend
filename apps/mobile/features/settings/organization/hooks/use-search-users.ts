import {useEffect, useMemo, useState} from 'react';
import {
  buildUserODataFilter,
  hasActiveUserFilters,
  searchUsersLocally,
  useUsersListManager,
  type UserFilterOptions,
  type UserFilterState,
  type User,
} from '@sykamore/store';

type UseSearchUsersOptions = {
  searchQuery: string;
  pageSize?: number;
  filters?: UserFilterOptions;
};

type UseHybridUserSearchOptions = {
  users: User[];
  searchQuery: string;
  onServerSearchNeeded: () => void;
  isUsingServerSearch: boolean;
  filters?: UserFilterOptions;
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
  filters,
}: UseHybridUserSearchOptions) {
  const parseDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const filteredByFilters = useMemo(() => {
    if (!filters) return users;

    const createdFrom = parseDate(filters.createdFrom);
    const createdTo = parseDate(filters.createdTo);

    return users.filter((user) => {
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      const createdAt = parseDate(user.created_at);
      if (createdFrom !== null) {
        if (createdAt === null || createdAt < createdFrom) {
          return false;
        }
      }
      if (createdTo !== null) {
        if (createdAt === null || createdAt > createdTo) {
          return false;
        }
      }

      return true;
    });
  }, [filters, users]);

  const filteredUsers = useMemo(() => {
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

    if (!hasSearchQuery) {
      return filteredByFilters;
    }

    if (isUsingServerSearch) {
      return filteredByFilters;
    }

    return searchUsersLocally(filteredByFilters, searchQuery);
  }, [filteredByFilters, searchQuery, isUsingServerSearch]);

  useEffect(() => {
    const hasQuery = searchQuery && searchQuery.trim().length > 0;
    const hasUsersLoaded = filteredByFilters.length > 0;
    const localFoundNothing =
      hasQuery && !isUsingServerSearch && filteredUsers.length === 0;

    if (localFoundNothing && hasUsersLoaded) {
      onServerSearchNeeded();
    }
  }, [
    searchQuery,
    filteredByFilters.length,
    filteredUsers.length,
    onServerSearchNeeded,
    isUsingServerSearch,
  ]);

  return filteredUsers;
}

export function useSearchUsers(options: UseSearchUsersOptions) {
  const {searchQuery, pageSize, filters} = options;
  const {shouldUseServerSearch, enableServerSearch} =
    useUserServerSearchState(searchQuery);

  const hasActiveFilters = useMemo(() => {
    const filterState: UserFilterState = filters ?? {};
    return hasActiveUserFilters(filterState);
  }, [filters]);

  const shouldUseRemote = shouldUseServerSearch || hasActiveFilters;

  const odataFilter = useMemo(() => {
    if (!shouldUseRemote) {
      return undefined;
    }
    const searchTerm = shouldUseServerSearch ? searchQuery : undefined;
    return buildUserODataFilter(filters, searchTerm);
  }, [searchQuery, filters, shouldUseRemote, shouldUseServerSearch]);

  const manager = useUsersListManager({
    odataFilter,
    pageSize,
    enabled: shouldUseRemote ? Boolean(odataFilter) : true,
  });

  const users = useHybridUserSearch({
    users: manager.users,
    searchQuery,
    isUsingServerSearch: shouldUseRemote,
    onServerSearchNeeded: enableServerSearch,
    filters,
  });

  return {
    ...manager,
    users,
    isUsingServerSearch: shouldUseRemote,
  };
}

export type UsersFilterOptions = UserFilterOptions;
