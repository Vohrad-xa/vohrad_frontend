import {createModifier, type ModifierConfig} from './createModifier';
import type {Color} from './types';

function createModifierWithEventListener(
  type: string,
  eventListener: (args: any) => void,
  params: Record<string, any> = {},
): ModifierConfig {
  return {$type: type, ...params, eventListener};
}

export const listSectionSpacing = (spacing: 'default' | 'compact' | number) => {
  if (typeof spacing === 'number') {
    return createModifier('listSectionSpacing', {
      spacing: 'custom',
      value: spacing,
    });
  }
  return createModifier('listSectionSpacing', {spacing});
};

export const cornerRadius = (radius: number) =>
  createModifier('cornerRadius', {radius});

export const shadow = (params: {
  radius: number;
  x?: number;
  y?: number;
  color?: Color;
}) => createModifier('shadow', params);

export const matchedGeometryEffect = (id: string, namespaceId: string) =>
  createModifier('matchedGeometryEffect', {id, namespaceId});

export const frame = (params: {
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  idealWidth?: number;
  idealHeight?: number;
  alignment?:
    | 'center'
    | 'leading'
    | 'trailing'
    | 'top'
    | 'bottom'
    | 'topLeading'
    | 'topTrailing'
    | 'bottomLeading'
    | 'bottomTrailing';
}) => createModifier('frame', params);

export const padding = (params?: {
  top?: number;
  bottom?: number;
  leading?: number;
  trailing?: number;
  horizontal?: number;
  vertical?: number;
  all?: number;
}) => createModifier('padding', params);

export const fixedSize = (params?: {
  horizontal?: boolean;
  vertical?: boolean;
}) => createModifier('fixedSize', params);

export const ignoreSafeArea = (params?: {
  regions?: 'all' | 'container' | 'keyboard';
  edges?:
    | 'all'
    | 'top'
    | 'bottom'
    | 'leading'
    | 'trailing'
    | 'horizontal'
    | 'vertical';
}) => createModifier('ignoreSafeArea', params);

export const onTapGesture = (handler: () => void) =>
  createModifierWithEventListener('onTapGesture', handler);

export const onLongPressGesture = (
  handler: () => void,
  minimumDuration?: number,
) =>
  createModifierWithEventListener('onLongPressGesture', handler, {
    minimumDuration: minimumDuration ?? 0.5,
  });

export const onAppear = (handler: () => void) =>
  createModifierWithEventListener('onAppear', handler);

export const onDisappear = (handler: () => void) =>
  createModifierWithEventListener('onDisappear', handler);

export const opacity = (value: number) => createModifier('opacity', {value});

export const clipShape = (
  shape: 'rectangle' | 'circle' | 'roundedRectangle',
  cornerRadius?: number,
) => createModifier('clipShape', {shape, cornerRadius});

export const border = (params: {color: Color; width?: number}) =>
  createModifier('border', params);

export const scaleEffect = (scale: number) =>
  createModifier('scaleEffect', {scale});

export const rotationEffect = (angle: number) =>
  createModifier('rotationEffect', {angle});

export const offset = (params: {x?: number; y?: number}) =>
  createModifier('offset', params);

export const foregroundColor = (color: Color) =>
  createModifier('foregroundColor', {color});

export const foregroundStyle = (
  style:
    | string
    | {type: 'color'; color: string}
    | {
        type: 'hierarchical';
        style: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary';
      }
    | {
        type: 'linearGradient';
        colors: string[];
        startPoint: {x: number; y: number};
        endPoint: {x: number; y: number};
      }
    | {
        type: 'radialGradient';
        colors: string[];
        center: {x: number; y: number};
        startRadius: number;
        endRadius: number;
      }
    | {
        type: 'angularGradient';
        colors: string[];
        center: {x: number; y: number};
      },
) => {
  if (typeof style === 'string') {
    return createModifier('foregroundStyle', {
      styleType: 'color',
      color: style,
    });
  }
  return createModifier('foregroundStyle', {styleType: style.type, ...style});
};

export const tint = (color: Color) => createModifier('tint', {color});

export const hidden = (hidden: boolean = true) =>
  createModifier('hidden', {hidden});

export const disabled = (disabled: boolean = true) =>
  createModifier('disabled', {disabled});

export const zIndex = (index: number) => createModifier('zIndex', {index});

export const blur = (radius: number) => createModifier('blur', {radius});

export const brightness = (amount: number) =>
  createModifier('brightness', {amount});

export const contrast = (amount: number) =>
  createModifier('contrast', {amount});

export const saturation = (amount: number) =>
  createModifier('saturation', {amount});

export const colorInvert = (inverted: boolean = true) =>
  createModifier('colorInvert', {inverted});

export const grayscale = (amount: number) =>
  createModifier('grayscale', {amount});

export const hueRotation = (angle: number) =>
  createModifier('hueRotation', {angle});

export const layoutPriority = (priority: number) =>
  createModifier('layoutPriority', {priority});

export const aspectRatio = (
  ratio: number,
  contentMode: 'fit' | 'fill' = 'fit',
) => createModifier('aspectRatio', {ratio, contentMode});

export const clipped = (clipped: boolean = true) =>
  createModifier('clipped', {clipped});

export const mask = (
  shape: 'rectangle' | 'circle' | 'roundedRectangle',
  cornerRadius?: number,
) => createModifier('mask', {shape, cornerRadius});

export const overlay = (color: Color, alignment: string = 'center') =>
  createModifier('overlay', {color, alignment});

export const backgroundOverlay = (color: Color, alignment: string = 'center') =>
  createModifier('backgroundOverlay', {color, alignment});

export const animation = (animation: any, animatedValue?: boolean | number) =>
  createModifier('animation', {animation, animatedValue});
