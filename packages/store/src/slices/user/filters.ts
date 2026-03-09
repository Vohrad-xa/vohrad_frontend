import {escapeString} from '../../utils/odata-filter-builder';

export type UserRoleFilter = {
  id: string;
  name: string;
};

export type UserFilterState = {
  role?: UserRoleFilter | null;
};

export type UserFilterOptions = UserFilterState;

/**
 * Build an OData filter string for tenant-user role and search.
 */
export function buildUserODataFilter(
  filters: UserFilterState = {},
  searchTerm?: string,
): string | undefined {
  const conditions: string[] = [];

  if (filters.role?.name) {
    conditions.push(`role/name eq '${escapeString(filters.role.name)}'`);
  }

  if (searchTerm && searchTerm.trim().length > 0) {
    const term = escapeString(searchTerm.trim());
    conditions.push(
      `(${[
        `contains(user/first_name,'${term}')`,
        `contains(user/last_name,'${term}')`,
        `contains(user/email,'${term}')`,
      ].join(' or ')})`,
    );
  }

  return conditions.length > 0 ? conditions.join(' and ') : undefined;
}

/**
 * True when a user filter state has any active conditions.
 */
export function hasActiveUserFilters(filters: UserFilterState): boolean {
  if (!filters) return false;
  return Boolean(filters.role?.name);
}

/**
 * Returns an empty user filter state.
 */
export function clearUserFilters(): UserFilterState {
  return {
    role: null,
  };
}
