import type {JsonValue, ItemFilterState} from '@vohrad/types';

// Builds an OData filter string based on item filter state and optional search term
export function buildODataFilter(
  filters: ItemFilterState,
  searchTerm?: string,
): string | undefined {
  const conditions: string[] = [];

  // Status filter
  if (filters.statuses && filters.statuses.length > 0) {
    const statusConditions = filters.statuses.map((status) =>
      status === 'active' ? 'is_active eq true' : 'is_active eq false',
    );
    conditions.push(`(${statusConditions.join(' or ')})`);
  }

  // Tracking mode filter
  if (filters.trackingModes && filters.trackingModes.length > 0) {
    const modeConditions = filters.trackingModes.map(
      (mode) => `tracking_mode eq '${mode}'`,
    );
    conditions.push(`(${modeConditions.join(' or ')})`);
  }

  // Price range filters
  if (filters.priceMin !== null && filters.priceMin !== undefined) {
    conditions.push(`price ge ${filters.priceMin}`);
  }

  if (filters.priceMax !== null && filters.priceMax !== undefined) {
    conditions.push(`price le ${filters.priceMax}`);
  }

  // Specifications filters
  if (filters.specifications) {
    Object.entries(filters.specifications).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        const formattedValue = formatODataValue(value);
        conditions.push(`specifications/${key} eq ${formattedValue}`);
      }
    });
  }

  // Search filter
  if (searchTerm && searchTerm.trim().length > 0) {
    const term = searchTerm.trim();
    const searchConditions = [
      `contains(name,'${term}')`,
      `contains(sku,'${term}')`,
      `contains(description,'${term}')`,
      `contains(barcode,'${term}')`,
    ];
    conditions.push(`(${searchConditions.join(' or ')})`);
  }

  return conditions.length > 0 ? conditions.join(' and ') : undefined;
}

// Formats a value for OData filter expression
function formatODataValue(value: JsonValue): string {
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  if (typeof value === 'boolean') {
    return value.toString();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  // For null, arrays, and objects, convert to string
  return `'${JSON.stringify(value)}'`;
}

// checks if any filter is active
export function hasActiveFilters(filters: ItemFilterState): boolean {
  if (filters.statuses && filters.statuses.length > 0) {
    return true;
  }
  if (filters.trackingModes && filters.trackingModes.length > 0) {
    return true;
  }
  if (filters.priceMin !== null && filters.priceMin !== undefined) {
    return true;
  }
  if (filters.priceMax !== null && filters.priceMax !== undefined) {
    return true;
  }
  if (
    filters.specifications &&
    Object.keys(filters.specifications).length > 0
  ) {
    return true;
  }
  return false;
}

// clear all filters
export function clearAllFilters(): ItemFilterState {
  return {
    statuses: [],
    trackingModes: [],
    priceMin: null,
    priceMax: null,
    specifications: null,
  };
}

// Attachment-specific filter utility
export function buildAttachmentSearchFilter(
  searchTerm: string,
): string | undefined {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return undefined;
  }

  const term = searchTerm.trim();
  return `contains(filename,'${term}') or contains(original_filename,'${term}') or contains(description,'${term}')`;
}

// User-specific filter utilities
export type UserFilterState = {
  role?: string | null;
  createdFrom?: string | null;
  createdTo?: string | null;
};

export type UserFilterOptions = UserFilterState;

const escapeString = (value: string) => value.replace(/'/g, "''");
const formatDateLiteral = (value: string) => `'${escapeString(value)}'`;

export function buildUserODataFilter(
  filters: UserFilterState = {},
  searchTerm?: string,
): string | undefined {
  const conditions: string[] = [];

  if (filters.role) {
    conditions.push(`role eq '${escapeString(filters.role)}'`);
  }

  if (filters.createdFrom) {
    conditions.push(`created_at ge ${formatDateLiteral(filters.createdFrom)}`);
  }

  if (filters.createdTo) {
    conditions.push(`created_at le ${formatDateLiteral(filters.createdTo)}`);
  }

  if (searchTerm && searchTerm.trim().length > 0) {
    const term = escapeString(searchTerm.trim());
    conditions.push(
      `contains(first_name,'${term}') or contains(last_name,'${term}') or contains(email,'${term}') or contains(role,'${term}')`,
    );
  }

  return conditions.length > 0 ? conditions.join(' and ') : undefined;
}

export function hasActiveUserFilters(filters: UserFilterState): boolean {
  if (!filters) return false;
  return Boolean(
    (filters.role && filters.role.trim().length > 0) ||
      (filters.createdFrom && filters.createdFrom.trim().length > 0) ||
      (filters.createdTo && filters.createdTo.trim().length > 0),
  );
}

export function clearUserFilters(): UserFilterState {
  return {
    role: null,
    createdFrom: null,
    createdTo: null,
  };
}
