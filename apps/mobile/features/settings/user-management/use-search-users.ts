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

const parseDateValue = (value?: string | null) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
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
  const filteredByFilters = useMemo(() => {
    if (!filters) return users;

    const roleFilter = filters.role?.trim() ?? '';
    const hasRoleFilter = roleFilter.length > 0;
    const createdFrom = parseDateValue(filters.createdFrom);
    const createdTo = parseDateValue(filters.createdTo);
    const hasDateFilter = createdFrom !== null || createdTo !== null;

    if (!hasRoleFilter && !hasDateFilter) {
      return users;
    }

    return users.filter((user) => {
      if (hasRoleFilter && user.role !== roleFilter) {
        return false;
      }

      if (hasDateFilter) {
        const createdAtValue = user.created_at;
        if (!createdAtValue) {
          return false;
        }
        const createdAt = parseDateValue(createdAtValue);
        if (createdAt === null) {
          return false;
        }
        if (createdFrom !== null && createdAt < createdFrom) {
          return false;
        }
        if (createdTo !== null && createdAt > createdTo) {
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

/**
 * Hybrid users query: local filter/search first, then switches to server when needed.
 *
 * - Server mode turns on when filters are set or local search finds no matches, and resets when the search query changes.
 * - While in server mode, local search is skipped (role/date filters still apply on the result set).
 */
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
    const normalizedSearchQuery = searchQuery.trim();
    const searchTerm =
      normalizedSearchQuery.length > 0 ? normalizedSearchQuery : undefined;
    return buildUserODataFilter(filters, searchTerm);
  }, [searchQuery, filters, shouldUseRemote]);

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
