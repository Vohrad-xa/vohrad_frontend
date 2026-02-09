import {requireNativeView} from 'expo';
import {I18nManager, StyleProp, ViewStyle} from 'react-native';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type HostProps = {
  matchContents?: boolean | {vertical?: boolean; horizontal?: boolean};
  useViewportSizeMeasurement?: boolean;
  onLayoutContent?: (event: {
    nativeEvent: {width: number; height: number};
  }) => void;
  colorScheme?: 'light' | 'dark';
  layoutDirection?: 'leftToRight' | 'rightToLeft';
  ignoreSafeArea?: 'all' | 'keyboard';
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
    ignoreSafeArea,
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
      ignoreSafeArea={ignoreSafeArea}
      {...restProps}
    />
  );
}
