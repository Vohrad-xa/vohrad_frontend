import type {AttachmentFilter} from '@sykamore/types';
import {escapeString} from '../../utils/odata-filter-builder';

/**
 * Build an attachment search $filter segment.
 */
export function buildAttachmentSearchFilter(
  searchTerm: string,
): string | undefined {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return undefined;
  }

  const term = escapeString(searchTerm.trim());
  return `contains(filename,'${term}') or contains(original_filename,'${term}') or contains(description,'${term}')`;
}

/**
 * Returns the normalized extension from an attachment filter.
 *
 * - Trims whitespace and lowercases the value.
 */
export function getAttachmentExtension(
  filter?: AttachmentFilter | null,
): string | null {
  return filter?.extension?.trim().toLowerCase() ?? null;
}

/**
 * Build an attachment $filter string from the stored filter state.
 *
 * - Explicit odataFilter takes precedence over extension.
 */
export function buildAttachmentODataFilter(
  filter?: AttachmentFilter | null,
): string | undefined {
  if (filter?.odataFilter) {
    return filter.odataFilter;
  }

  const normalizedExtension = getAttachmentExtension(filter);
  return normalizedExtension
    ? `extension eq '${normalizedExtension}'`
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
