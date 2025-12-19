import {createModifier} from './createModifier';

export const containerShape = (
  shape:
    | 'rectangle'
    | 'capsule'
    | 'circle'
    | 'roundedRectangle'
    | 'containerRelative',
  cornerRadius?: number,
) => createModifier('containerShape', {shape, cornerRadius});
