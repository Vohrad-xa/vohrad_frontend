import type {
  OrderByDirection,
  UserSortKey,
  UserSortState,
} from '@sykamore/types';
import {buildODataOrderBy} from '../../utils/odata-orderby-builder';

const DEFAULT_USER_SORT: UserSortState = {
  key: 'date',
  direction: 'desc',
};

/**
 * Parses a user $orderby string into a UI-friendly sort state.
 */
export function parseUserOrderBy(orderby?: string): UserSortState {
  if (!orderby) {
    return DEFAULT_USER_SORT;
  }

  const [firstSegment] = orderby.split(',');
  const segment = firstSegment?.trim();
  if (!segment) {
    return DEFAULT_USER_SORT;
  }

  const [field, direction] = segment.split(/\s+/);
  if (!field) {
    return DEFAULT_USER_SORT;
  }

  const normalizedDirection: OrderByDirection =
    direction?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  if (field === 'created_at') {
    return {key: 'date', direction: normalizedDirection};
  }

  if (field === 'first_name' || field === 'last_name') {
    return {key: 'name', direction: normalizedDirection};
  }

  if (field === 'role') {
    return {key: 'role', direction: normalizedDirection};
  }

  return DEFAULT_USER_SORT;
}

/**
 * Builds a user $orderby string for date/name/role sorting.
 */
export function buildUserOrderBy(
  key: UserSortKey,
  direction: OrderByDirection,
): string | undefined {
  if (key === 'date') {
    return buildODataOrderBy([{field: 'created_at', direction}]);
  }

  if (key === 'role') {
    return buildODataOrderBy([{field: 'role', direction}]);
  }

  return buildODataOrderBy([
    {field: 'first_name', direction},
    {field: 'last_name', direction},
  ]);
}
