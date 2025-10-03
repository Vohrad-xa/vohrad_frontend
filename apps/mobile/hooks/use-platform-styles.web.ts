import type {CSSProperties} from 'react';
import type {ViewStyle} from 'react-native';
import type {PlatformStyles} from '@/types/platform';

export const usePlatformStyles = <TWeb extends CSSProperties>(
  styles: PlatformStyles<ViewStyle, TWeb>,
): TWeb => {
  if (styles.web) {
    return styles.web;
  }

  if (styles.mobile) {
    return styles.mobile as unknown as TWeb;
  }

  return {} as TWeb;
};
