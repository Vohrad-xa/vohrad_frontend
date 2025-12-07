import {createModifier} from './createModifier';

/**
 * Associates an arbitrary tag value with a view.
 * Useful for selection in lists or pickers.
 */
export const tag = (tag: string | number) => createModifier('tag', {tag});
