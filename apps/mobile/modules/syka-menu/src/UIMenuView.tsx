import type * as React from 'react';
import {View} from 'react-native';

import type {NativeMenuComponentProps} from './types';

const SykaMenuView: React.FC<
  React.PropsWithChildren<NativeMenuComponentProps>
> = ({
  style,
  children,
  testID,
  accessibilityLabel,
  accessibilityHint,
}) => {
  return (
    <View
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {children}
    </View>
  );
};

export default SykaMenuView;
