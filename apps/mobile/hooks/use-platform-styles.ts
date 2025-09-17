import { Platform, ViewStyle } from 'react-native';

interface PlatformStyles {
  web?: ViewStyle | any;
  mobile?: ViewStyle;
  ios?: ViewStyle;
  android?: ViewStyle;
}

export const usePlatformStyles = (styles: PlatformStyles): ViewStyle | any => {
  if (Platform.OS === 'web' && styles.web) {
    return styles.web;
  }

  if (Platform.OS === 'ios' && styles.ios) {
    return styles.ios;
  }

  if (Platform.OS === 'android' && styles.android) {
    return styles.android;
  }

  if (styles.mobile && (Platform.OS === 'ios' || Platform.OS === 'android')) {
    return styles.mobile;
  }

  return {};
};

export const createPlatformStyle = (styles: PlatformStyles): ViewStyle | any => {
  return usePlatformStyles(styles);
};
