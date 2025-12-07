import {
  type ColorSchemeName,
  I18nManager,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {requireNativeView} from 'expo';

import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type HostProps = {
  /** Update size to match SwiftUI content layout */
  matchContents?: boolean | {vertical?: boolean; horizontal?: boolean};
  /** Use viewport size for SwiftUI layout when no explicit size is provided */
  useViewportSizeMeasurement?: boolean;
  /** Callback when SwiftUI content completes layout */
  onLayoutContent?: (event: {
    nativeEvent: {width: number; height: number};
  }) => void;
  colorScheme?: ColorSchemeName;
  layoutDirection?: 'leftToRight' | 'rightToLeft';
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
} & CommonViewModifierProps;

const HostNativeView: React.ComponentType<
  HostProps & {
    matchContentsVertical?: boolean;
    matchContentsHorizontal?: boolean;
  }
> = requireNativeView('SykamoreUi', 'HostView');

/**
 * Hosting component for SwiftUI views.
 * Use this as the root wrapper for all SwiftUI components.
 */
export function Host(props: HostProps) {
  const {
    matchContents,
    onLayoutContent,
    modifiers,
    layoutDirection,
    ...restProps
  } = props;

  return (
    <HostNativeView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      matchContentsVertical={
        typeof matchContents === 'object'
          ? matchContents.vertical
          : matchContents
      }
      matchContentsHorizontal={
        typeof matchContents === 'object'
          ? matchContents.horizontal
          : matchContents
      }
      onLayoutContent={onLayoutContent}
      layoutDirection={
        layoutDirection ??
        (I18nManager.getConstants().isRTL ? 'rightToLeft' : 'leftToRight')
      }
      {...restProps}
    />
  );
}
