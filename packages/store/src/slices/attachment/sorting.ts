import type {
  AttachmentSortKey,
  AttachmentSortState,
  OrderByDirection,
} from '@sykamore/types';
import {
  buildCreatedAtOrderBy,
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

  if (field === 'created_at') {
    return {key: 'date', direction: normalizedDirection};
  }

  if (field === 'original_filename' || field === 'filename') {
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
    return buildCreatedAtOrderBy(direction);
  }

  return buildODataOrderBy([
    {field: 'original_filename', direction},
    {field: 'filename', direction},
  ]);
}
