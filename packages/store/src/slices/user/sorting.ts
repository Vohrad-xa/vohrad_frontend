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

  if (field === 'date') {
    return {key: 'date', direction: normalizedDirection};
  }

  if (field === 'name') {
    return {key: 'name', direction: normalizedDirection};
  }

  return DEFAULT_USER_SORT;
}

/**
 * Builds a user $orderby string for date/name sorting.
 */
export function buildUserOrderBy(
  key: UserSortKey,
  direction: OrderByDirection,
): string | undefined {
  if (key === 'date') {
    return buildODataOrderBy([{field: 'date', direction}]);
  }

  return buildODataOrderBy([{field: 'name', direction}]);
}
