import type {ViewStyle, TextStyle, ImageStyle} from 'react-native';
import {StyleSheet} from 'react-native';

type AnyStyle = ViewStyle | TextStyle | ImageStyle;
type NamedStyles<T> = {[P in keyof T]: AnyStyle};

// A factory function that creates and caches styles based on input parameters.
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
