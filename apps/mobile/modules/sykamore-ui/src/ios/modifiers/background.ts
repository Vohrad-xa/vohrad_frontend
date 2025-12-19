import {createModifier} from './createModifier';
import type {Color} from './types';

export const background = (color: Color) =>
  createModifier('background', {color});
