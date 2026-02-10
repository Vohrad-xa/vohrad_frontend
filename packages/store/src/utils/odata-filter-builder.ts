import type {JsonValue} from '@sykamore/types';

/**
 * Formats a value for an OData filter expression.
 */
export function formatODataValue(value: JsonValue): string {
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return `'${escapeString(value)}'`;
  }
  if (typeof value === 'boolean') {
    return value.toString();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  // For arrays and objects, convert to a JSON literal string.
  return `'${escapeString(JSON.stringify(value))}'`;
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
