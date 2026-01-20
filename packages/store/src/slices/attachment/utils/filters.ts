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
  return normalizeAttachmentExtension(filter?.extension);
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

const decodeODataLiteral = (value: string): string => value.replace(/''/g, "'");

const extractODataExtension = (filter: string): string | null => {
  const match = /extension eq '((?:''|[^'])*)'/.exec(filter);
  if (!match) return null;
  return decodeODataLiteral(match[1]);
};

const extractODataSearchTerm = (filter: string): string | null => {
  const match = /contains\(filename,'((?:''|[^'])*)'\)/.exec(filter);
  if (!match) return null;
  return decodeODataLiteral(match[1]);
};

type AttachmentODataCriteria = {
  extension?: string | null;
  searchTerm?: string | null;
};

const parseAttachmentODataCriteria = (
  filter: string,
): AttachmentODataCriteria | null => {
  const extension = extractODataExtension(filter);
  const searchTerm = extractODataSearchTerm(filter);

  if (!extension && !searchTerm) {
    return null;
  }

  return {extension, searchTerm};
};

/**
 * Checks an attachment against OData filters built by attachment utilities.
 *
 * - Supports extension and search-term filters only.
 */
export function matchesAttachmentODataFilter(
  attachment: ItemAttachment,
  filter: string,
): boolean {
  const criteria = parseAttachmentODataCriteria(filter);
  if (!criteria) {
    return false;
  }

  if (criteria.extension) {
    const normalizedFilter = normalizeAttachmentExtension(criteria.extension);
    const normalizedAttachment = normalizeAttachmentExtension(
      attachment.extension,
    );
    if (!normalizedFilter || normalizedFilter !== normalizedAttachment) {
      return false;
    }
  }

  if (criteria.searchTerm) {
    const filename = attachment.filename ?? '';
    const originalFilename = attachment.original_filename ?? '';
    const description = attachment.description ?? '';
    const matches =
      filename.includes(criteria.searchTerm) ||
      originalFilename.includes(criteria.searchTerm) ||
      description.includes(criteria.searchTerm);
    if (!matches) {
      return false;
    }
  }

  return true;
}

export function matchesAttachmentListFilters(
  attachment: ItemAttachment,
  filters: AttachmentListFilters,
): boolean {
  if (filters.targetType) {
    const attachmentTargetType = normalizeAttachmentTargetType(
      attachment.attachable_type,
    );
    if (attachmentTargetType !== filters.targetType) {
      return false;
    }
  }

  if (
    filters.targetId &&
    String(attachment.attachable_id) !== String(filters.targetId)
  ) {
    return false;
  }

  if (
    filters.kind &&
    (attachment.kind ?? '').toLowerCase() !== filters.kind.toLowerCase()
  ) {
    return false;
  }

  if (filters.odataFilter) {
    return matchesAttachmentODataFilter(attachment, filters.odataFilter);
  }

  return true;
}
