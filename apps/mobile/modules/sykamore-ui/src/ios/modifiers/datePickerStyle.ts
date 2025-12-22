import {createModifier} from './createModifier';

export type DatePickerStyleType =
  | 'automatic'
  | 'compact'
  | 'graphical'
  | 'wheel';

export const datePickerStyle = (style: DatePickerStyleType) =>
  createModifier('datePickerStyle', {style});
