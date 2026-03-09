import {useMemo} from 'react';
import {
  buildUserODataFilter,
  hasActiveUserFilters,
  useUsersListManager,
  type UserFilterOptions,
  type UserFilterState,
} from '@sykamore/store';

type UseSearchUsersOptions = {
  searchQuery: string;
  pageSize?: number;
  filters?: UserFilterOptions;
  odataOrderBy?: string;
};

/**
 * Server-driven users query backed by TanStack Query.
 *
 * Search, filter, and sort are all expressed through the backend query contract.
 * The mobile search provider already debounces the incoming search query.
 */
export function useSearchUsers(options: UseSearchUsersOptions) {
  const {searchQuery, pageSize, filters, odataOrderBy} = options;

  const normalizedFilters = useMemo<UserFilterState>(
    () => filters ?? {},
    [filters],
  );
  const normalizedSearchQuery = searchQuery.trim();

  const hasActiveFilters = useMemo(
    () => hasActiveUserFilters(normalizedFilters),
    [normalizedFilters],
  );

  const odataFilter = useMemo(
    () =>
      buildUserODataFilter(
        normalizedFilters,
        normalizedSearchQuery.length > 0 ? normalizedSearchQuery : undefined,
      ),
    [normalizedFilters, normalizedSearchQuery],
  );

  const manager = useUsersListManager({
    odataFilter,
    odataOrderBy,
    pageSize,
    enabled: true,
  });

  return {
    ...manager,
    isUsingServerSearch:
      normalizedSearchQuery.length > 0 ||
      hasActiveFilters ||
      Boolean(odataOrderBy),
  };
}

export type UsersFilterOptions = UserFilterOptions;
