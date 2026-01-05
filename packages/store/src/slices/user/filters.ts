import {escapeString} from '../../utils/odata-filter-builder';

export type UserFilterState = {
  role?: string | null;
};

export type UserFilterOptions = UserFilterState;

/**
 * Build an OData filter string for user role and search.
 */
export function buildUserODataFilter(
  filters: UserFilterState = {},
  searchTerm?: string,
): string | undefined {
  const conditions: string[] = [];

  if (filters.role) {
    conditions.push(`role eq '${escapeString(filters.role)}'`);
  }

  if (searchTerm && searchTerm.trim().length > 0) {
    const term = escapeString(searchTerm.trim());
    conditions.push(
      `contains(first_name,'${term}') or contains(last_name,'${term}') or contains(email,'${term}') or contains(role,'${term}')`,
    );
  }

  return conditions.length > 0 ? conditions.join(' and ') : undefined;
}

/**
 * True when a user filter state has any active conditions.
 */
export function hasActiveUserFilters(filters: UserFilterState): boolean {
  if (!filters) return false;
  return Boolean(filters.role && filters.role.trim().length > 0);
}

/**
 * Returns an empty user filter state.
 */
export function clearUserFilters(): UserFilterState {
  return {
    role: null,
  };
}
