import type {AttachmentFilter, ItemAttachment} from '@sykamore/types';
import {escapeString} from '../../../utils/odata-filter-builder';
import type {AttachmentListFilters} from './query-keys';
import {
  normalizeAttachmentExtension,
  normalizeAttachmentTargetType,
} from './normalizers';

/**
 * Build an attachment search $filter segment.
 */
export function buildAttachmentSearchFilter(
  searchTerm: string,
): string | undefined {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return undefined;
  }

  const term = escapeString(searchTerm.trim().toLowerCase());
  return `contains(tolower(filename),'${term}') or contains(tolower(original_filename),'${term}') or contains(tolower(description),'${term}')`;
}

/**
 * Returns the normalized extension from an attachment filter.
 *
 * - Trims whitespace and lowercases the value.
 */
export function getAttachmentExtension(
  filter?: AttachmentFilter | null,
): string | null {
  return normalizeAttachmentExtension(filter?.extension);
}

/**
 * Build an attachment $filter string from the stored filter state.
 */
export function buildAttachmentODataFilter(
  filter?: AttachmentFilter | null,
): string | undefined {
  const normalizedExtension = getAttachmentExtension(filter);
  return normalizedExtension
    ? `extension eq '${escapeString(normalizedExtension)}'`
    : undefined;
}

/**
 * True when an attachment extension filter is active.
 */
export function hasAttachmentExtension(
  filter?: AttachmentFilter | null,
): boolean {
  return Boolean(getAttachmentExtension(filter));
}

/**
 * Build an attachment search $filter segment scoped by extension.
 *
 * - Combines search and extension with AND when both are present.
 */
export function buildAttachmentSearchODataFilter(
  searchTerm: string,
  extension?: string | null,
): string | undefined {
  const searchFilter = buildAttachmentSearchFilter(searchTerm);
  if (!searchFilter) {
    return undefined;
  }

  const extensionFilter = buildAttachmentODataFilter(
    extension ? {extension} : null,
  );
  if (!extensionFilter) {
    return searchFilter;
  }

  return `(${searchFilter}) and (${extensionFilter})`;
}

export function matchesAttachmentListFilters(
  attachment: ItemAttachment,
  filters: AttachmentListFilters,
): boolean {
  if (filters.targetType) {
    const attachmentTargetType = normalizeAttachmentTargetType(
      attachment.target_type,
    );
    if (attachmentTargetType !== filters.targetType) {
      return false;
    }
  }

  if (
    filters.targetId &&
    String(attachment.target_id) !== String(filters.targetId)
  ) {
    return false;
  }

  if (
    filters.kind &&
    (attachment.kind ?? '').toLowerCase() !== filters.kind.toLowerCase()
  ) {
    return false;
  }

  const normalizedFilterExtension = normalizeAttachmentExtension(
    filters.extension ?? undefined,
  );
  if (normalizedFilterExtension) {
    const normalizedAttachmentExtension = normalizeAttachmentExtension(
      attachment.extension,
    );
    if (normalizedAttachmentExtension !== normalizedFilterExtension) {
      return false;
    }
  }

  const searchQuery = filters.searchQuery?.trim();
  if (searchQuery) {
    const normalizedQuery = searchQuery.toLowerCase();
    const filename = (attachment.filename ?? '').toLowerCase();
    const originalFilename = (attachment.original_filename ?? '').toLowerCase();
    const description = (attachment.description ?? '').toLowerCase();
    const matches =
      filename.includes(normalizedQuery) ||
      originalFilename.includes(normalizedQuery) ||
      description.includes(normalizedQuery);
    if (!matches) {
      return false;
    }
  }

  return true;
}
