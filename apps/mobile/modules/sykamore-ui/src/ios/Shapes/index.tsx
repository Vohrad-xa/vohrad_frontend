import {requireNativeView} from 'expo';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

// RoundedRectangle

export interface RoundedRectangleProps extends CommonViewModifierProps {
  cornerRadius?: number;
  cornerStyle?: 'continuous' | 'circular';
}

const RoundedRectangleNativeView: React.ComponentType<RoundedRectangleProps> =
  requireNativeView('SykamoreUi', 'RoundedRectangleView');

/** @see [SwiftUI RoundedRectangle](https://developer.apple.com/documentation/swiftui/roundedrectangle) */
export function RoundedRectangle(props: RoundedRectangleProps) {
  const {modifiers, ...restProps} = props;
  return (
    <RoundedRectangleNativeView
      {...restProps}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
    />
  );
}

// Circle

export interface CircleProps extends CommonViewModifierProps {}

const CircleNativeView: React.ComponentType<CircleProps> = requireNativeView(
  'SykamoreUi',
  'CircleView',
);

/** @see [SwiftUI Circle](https://developer.apple.com/documentation/swiftui/circle) */
export function Circle(props: CircleProps) {
  const {modifiers, ...restProps} = props;
  return (
    <CircleNativeView
      {...restProps}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
    />
  );
}

// ConcentricRectangle

/**
 * - `concentric`: corners scale concentrically (Liquid Glass default).
 * - `fixed`: corner has an explicit fixed radius.
 */
export type CornerStyleConfig =
  | {type: 'concentric'; minimumRadius?: number}
  | {type: 'fixed'; radius: number};

export interface ConcentricRectangleCornerParams {
  topLeadingCorner?: CornerStyleConfig;
  topTrailingCorner?: CornerStyleConfig;
  bottomLeadingCorner?: CornerStyleConfig;
  bottomTrailingCorner?: CornerStyleConfig;
}

export interface ConcentricRectangleProps extends CommonViewModifierProps {
  corners?: ConcentricRectangleCornerParams;
}

/** Helpers for building `CornerStyleConfig` values. */
export const EdgeCornerStyle = {
  concentric: (minimumRadius?: number): CornerStyleConfig => ({
    type: 'concentric',
    minimumRadius,
  }),
  fixed: (radius: number): CornerStyleConfig => ({
    type: 'fixed',
    radius,
  }),
};

const ConcentricRectangleNativeView: React.ComponentType<ConcentricRectangleProps> =
  requireNativeView('SykamoreUi', 'ConcentricRectangleView');

/**
 * Rectangle whose corners nest concentrically inside surrounding rounded shapes (Liquid Glass).
 *
 * @platform iOS 26.0+
 * @see [SwiftUI ConcentricRectangle](https://developer.apple.com/documentation/swiftui/concentricrectangle)
 */
export function ConcentricRectangle(props: ConcentricRectangleProps) {
  const {modifiers, ...restProps} = props;
  return (
    <ConcentricRectangleNativeView
      {...restProps}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
    />
  );
}
