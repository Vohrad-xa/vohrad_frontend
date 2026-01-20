import type {
  AttachmentSortKey,
  AttachmentSortState,
  OrderByDirection,
} from '@sykamore/types';
import {buildODataOrderBy} from '../../../utils/odata-orderby-builder';
import type {AttachmentDisplayItem} from './attachment-display';

const DEFAULT_ATTACHMENT_SORT: AttachmentSortState = {
  key: 'date',
  direction: 'desc',
};

/**
 * Parses an attachment $orderby string into a UI-friendly sort state.
 */
export function parseAttachmentOrderBy(orderby?: string): AttachmentSortState {
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

  if (field === 'size') {
    return {key: 'size', direction: normalizedDirection};
  }

  return DEFAULT_ATTACHMENT_SORT;
}

/**
 * Builds an attachment $orderby string for date/name/size sorting.
 */
export function buildAttachmentOrderBy(
  key: AttachmentSortKey,
  direction: OrderByDirection,
): string | undefined {
  if (key === 'date') {
    return buildODataOrderBy([{field: 'date', direction}]);
  }

  if (key === 'size') {
    return buildODataOrderBy([{field: 'size', direction}]);
  }

  return buildODataOrderBy([{field: 'name', direction}]);
}

const resolveAttachmentName = (attachment: AttachmentDisplayItem): string =>
  (attachment.original_filename || attachment.filename || '').toLowerCase();

const resolveAttachmentDate = (attachment: AttachmentDisplayItem): number => {
  const timestamp = attachment.created_at
    ? Date.parse(attachment.created_at)
    : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const resolveAttachmentSize = (attachment: AttachmentDisplayItem): number =>
  Number.isFinite(attachment.size) ? attachment.size : 0;

/**
 * Compares attachments using the current attachment orderBy string.
 */
export function compareAttachmentsForOrderBy(
  first: AttachmentDisplayItem,
  second: AttachmentDisplayItem,
  orderBy?: string,
): number {
  const sortState = parseAttachmentOrderBy(orderBy);

  if (sortState.key === 'name') {
    const firstName = resolveAttachmentName(first);
    const secondName = resolveAttachmentName(second);
    return sortState.direction === 'asc'
      ? firstName.localeCompare(secondName)
      : secondName.localeCompare(firstName);
  }

  if (sortState.key === 'size') {
    const firstSize = resolveAttachmentSize(first);
    const secondSize = resolveAttachmentSize(second);
    return sortState.direction === 'asc'
      ? firstSize - secondSize
      : secondSize - firstSize;
  }

  const firstDate = resolveAttachmentDate(first);
  const secondDate = resolveAttachmentDate(second);
  return sortState.direction === 'asc'
    ? firstDate - secondDate
    : secondDate - firstDate;
}
