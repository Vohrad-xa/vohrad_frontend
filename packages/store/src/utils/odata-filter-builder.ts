import type {JsonValue} from '@sykamore/types';

/**
 * Formats a value for an OData filter expression.
 */
export function formatODataValue(value: JsonValue): string {
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

/**
 * Escapes a string for OData literals.
 */
export function escapeString(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Formats a date literal for OData filters.
 */
export function formatDateLiteral(value: string): string {
  return `'${escapeString(value)}'`;
}
