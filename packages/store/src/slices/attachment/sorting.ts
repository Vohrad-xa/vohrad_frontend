import type {
  AttachmentSortKey,
  AttachmentSortState,
  OrderByDirection,
} from '@sykamore/types';
import {
  buildODataOrderBy,
} from '../../utils/odata-orderby-builder';

const DEFAULT_ATTACHMENT_SORT: AttachmentSortState = {
  key: 'date',
  direction: 'desc',
};

/**
 * Parses an attachment $orderby string into a UI-friendly sort state.
 */
export function parseAttachmentOrderBy(
  orderby?: string,
): AttachmentSortState {
  if (!orderby) {
    return DEFAULT_ATTACHMENT_SORT;
  }

  const [firstSegment] = orderby.split(',');
  const segment = firstSegment?.trim();
  if (!segment) {
    return DEFAULT_ATTACHMENT_SORT;
  }

  const [field, direction] = segment.split(/\s+/);
  if (!field) {
    return DEFAULT_ATTACHMENT_SORT;
  }

  const normalizedDirection: OrderByDirection =
    direction?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  if (field === 'date') {
    return {key: 'date', direction: normalizedDirection};
  }

  if (field === 'name') {
    return {key: 'name', direction: normalizedDirection};
  }

  return DEFAULT_ATTACHMENT_SORT;
}

/**
 * Builds an attachment $orderby string for date/name sorting.
 */
export function buildAttachmentOrderBy(
  key: AttachmentSortKey,
  direction: OrderByDirection,
): string | undefined {
  if (key === 'date') {
    return buildODataOrderBy([{field: 'date', direction}]);
  }

  return buildODataOrderBy([{field: 'name', direction}]);
}
