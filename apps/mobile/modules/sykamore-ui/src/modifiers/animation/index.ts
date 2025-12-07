import {createModifier} from '../createModifier';
import type {AnimationConfig} from './types';

export const animation = (
  animation: AnimationConfig,
  animatedValue?: boolean | number,
) => createModifier('animation', {animation, animatedValue});
