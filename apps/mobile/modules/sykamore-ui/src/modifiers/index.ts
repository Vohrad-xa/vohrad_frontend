/**
 * Modifier factory functions and types.
 */
export {createModifier} from './createModifier';
export type {ModifierConfig as ViewModifier} from './createModifier';
export {createViewModifierEventListener} from './utils';

export {
  listSectionSpacing,
  cornerRadius,
  shadow,
  matchedGeometryEffect,
  frame,
  padding,
  fixedSize,
  ignoreSafeArea,
  onTapGesture,
  onLongPressGesture,
  onAppear,
  onDisappear,
  opacity,
  clipShape,
  border,
  scaleEffect,
  rotationEffect,
  offset,
  foregroundColor,
  foregroundStyle,
  tint,
  hidden,
  disabled,
  zIndex,
  blur,
  brightness,
  contrast,
  saturation,
  colorInvert,
  grayscale,
  hueRotation,
  layoutPriority,
  aspectRatio,
  clipped,
  mask,
  overlay,
  backgroundOverlay,
  animation,
} from './modifiers';

export {background} from './background';
export {containerShape} from './containerShape';
export {pickerStyle} from './pickerStyle';
export {tag} from './tag';
export type {Color} from './types';
export * from './animation/types';
export * from './shapes';

// Existing custom modifier
export {swipeActions} from './swipeActions';
export type {
  ModifierSwipeAction,
  SwipeActionRole as ModifierSwipeActionRole,
  SwipeActionsOptions,
  SwipeEdge,
} from './swipeActions';
