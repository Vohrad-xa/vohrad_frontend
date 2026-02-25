import type {ViewStyle, TextStyle, ImageStyle} from 'react-native';
import {StyleSheet} from 'react-native';

type AnyStyle = ViewStyle | TextStyle | ImageStyle;
type NamedStyles<T> = {[P in keyof T]: AnyStyle};

/**
 * Creates a memoized StyleSheet factory keyed by the result of toKey().
 *
 * - Calls StyleSheet.create() only once per unique key, caching the result for re-renders.
 * - Evicts the oldest entry when the cache exceeds max (default 64) to bound memory usage.
 */
export function makeStyleFactory<
  T extends NamedStyles<T> | NamedStyles<Record<string, AnyStyle>>,
  Args extends readonly unknown[],
>(
  factory: (...args: [...Args]) => T,
  toKey: (...args: [...Args]) => string,
  max = 64,
) {
  const cache = new Map<string, T>();
  return (...args: [...Args]): T => {
    const k = toKey(...args);
    const hit = cache.get(k);
    if (hit) return hit;
    const created = StyleSheet.create(factory(...args));
    cache.set(k, created);
    if (cache.size > max) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    return created;
  };
}
