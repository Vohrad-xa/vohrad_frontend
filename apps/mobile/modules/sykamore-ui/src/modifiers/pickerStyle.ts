import {createModifier} from './createModifier';

export const pickerStyle = (
  style: 'automatic' | 'inline' | 'menu' | 'navigationLink' | 'segmented',
) => createModifier('pickerStyle', {style});
