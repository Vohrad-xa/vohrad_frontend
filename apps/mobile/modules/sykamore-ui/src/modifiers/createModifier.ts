/** Base interface for view modifiers */
export interface ModifierConfig {
  $type: string;
  [key: string]: any;
  eventListener?: (args: any) => void;
}

/** Create a modifier configuration object */
export function createModifier(
  type: string,
  params: Record<string, any> = {},
): ModifierConfig {
  return {$type: type, ...params};
}
