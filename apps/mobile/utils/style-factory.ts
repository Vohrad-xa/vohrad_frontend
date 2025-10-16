import {StyleSheet, ViewStyle, TextStyle, ImageStyle} from 'react-native';

type AnyStyle = ViewStyle | TextStyle | ImageStyle;
type NamedStyles<T> = {[P in keyof T]: AnyStyle};

export function makeStyleFactory<
  T extends NamedStyles<T> | NamedStyles<any>,
  A extends any[],
>(factory: (...args: A) => T, toKey: (...args: A) => string, max = 64) {
  const cache = new Map<string, T>();
  return (...args: A): T => {
    const k = toKey(...args);
    const hit = cache.get(k);
    if (hit) return hit;
    const created = StyleSheet.create(factory(...args));
    cache.set(k, created);
    if (cache.size > max) cache.delete(cache.keys().next().value!);
    return created;
  };
}
