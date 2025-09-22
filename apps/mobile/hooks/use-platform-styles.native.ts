import type {CSSProperties} from 'react';
import {Platform, type ViewStyle} from 'react-native';
import type {PlatformStyles} from '@/types/platform';

export const usePlatformStyles = <TMobile extends ViewStyle>(
  styles: PlatformStyles<TMobile, CSSProperties>,
): TMobile => {
  if (Platform.OS === 'ios' && styles.ios) {
    return styles.ios;
  }

  if (Platform.OS === 'android' && styles.android) {
    return styles.android;
  }

  if (styles.mobile) {
    return styles.mobile;
  }

  return {} as TMobile;
};
