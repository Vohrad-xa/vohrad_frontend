import type {PaginatedResponse} from '@sykamore/types';
import type {AttachmentDisplayItem} from './attachment-display';
import {matchesAttachmentListFilters} from './filters';
import type {AttachmentListFilters} from './query-keys';
import {compareAttachmentsForOrderBy} from './sorting';

export type InfiniteAttachmentsData = {
  pages: Array<PaginatedResponse<AttachmentDisplayItem>>;
  pageParams: unknown[];
};

const insertIntoSortedPage = (
  items: AttachmentDisplayItem[],
  attachment: AttachmentDisplayItem,
  pageSize: number,
  orderBy?: string,
): AttachmentDisplayItem[] => {
  if (items.some((item) => item.id === attachment.id)) {
    return items;
  }

  const resolvedPageSize = pageSize > 0 ? pageSize : items.length;
  const isPageFull = items.length >= resolvedPageSize;

  let insertIndex = items.length;
  for (let idx = 0; idx < items.length; idx += 1) {
    if (compareAttachmentsForOrderBy(attachment, items[idx], orderBy) < 0) {
      insertIndex = idx;
      break;
    }
  }

  if (isPageFull && insertIndex >= resolvedPageSize) {
    return items;
  }

  const nextItems = items.slice();
  nextItems.splice(insertIndex, 0, attachment);
  if (resolvedPageSize > 0 && nextItems.length > resolvedPageSize) {
    nextItems.length = resolvedPageSize;
  }

  return nextItems;
};

/**
 * Updates page 1 of an infinite attachments cache when an upload belongs there.
 *
 * - Only applies to extension/search odata filters produced by attachment filters.
 */
export function updateInfiniteAttachmentsCacheForUpload(
  data: InfiniteAttachmentsData,
  attachment: AttachmentDisplayItem,
  filters: AttachmentListFilters,
  pageSize: number,
): InfiniteAttachmentsData | null {
  if (!matchesAttachmentListFilters(attachment, filters)) {
    return null;
  }

  const pages = data.pages ?? [];
  if (pages.length === 0) {
    return null;
  }

  const firstPage = pages[0];
  const nextItems = insertIntoSortedPage(
    firstPage.items,
    attachment,
    pageSize,
    filters.odataOrderBy,
  );

  if (nextItems === firstPage.items) {
    return null;
  }

  return {
    ...data,
    pages: [{...firstPage, items: nextItems}, ...pages.slice(1)],
  };
}
