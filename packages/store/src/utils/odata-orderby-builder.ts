import type {
  OrderByClause,
  OrderByDirection,
} from '@sykamore/types';

/**
 * Build an OData $orderby string from an ordered list of clauses.
 *
 * - Throws if a clause is missing a field or uses an invalid direction.
 */
export function buildODataOrderBy(
  clauses?: OrderByClause[],
): string | undefined {
  if (!clauses || clauses.length === 0) {
    return undefined;
  }

  const segments = clauses.map(({field, direction}) => {
    const normalizedField = field.trim();
    if (!normalizedField) {
      throw new Error('OData order by field is required.');
    }

    if (!direction) {
      return normalizedField;
    }

    const normalizedDirection = direction.toLowerCase() as OrderByDirection;
    if (normalizedDirection !== 'asc' && normalizedDirection !== 'desc') {
      throw new Error(`Invalid OData order by direction: ${direction}`);
    }

    return `${normalizedField} ${normalizedDirection}`;
  });

  return segments.length > 0 ? segments.join(', ') : undefined;
}

/**
 * Build a created_at $orderby string with a default descending order.
 */
export function buildCreatedAtOrderBy(
  direction: OrderByDirection = 'desc',
): string | undefined {
  return buildODataOrderBy([{field: 'created_at', direction}]);
}
