import type {CSSProperties} from 'react';
import type {ViewStyle} from 'react-native';

export type PlatformStyles<
  TMobile extends ViewStyle = ViewStyle,
  TWeb extends CSSProperties = CSSProperties,
> = {
  web?: TWeb;
  mobile?: TMobile;
  ios?: TMobile;
  android?: TMobile;
};
