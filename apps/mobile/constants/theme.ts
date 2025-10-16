import type {Tokens} from './colors';
import type {DesignSystem} from './typography';

export type ThemeShape = typeof Tokens.light | typeof Tokens.dark;
export type DSShape = typeof DesignSystem;

export const themeKey = (t: ThemeShape, ds: DSShape) =>
  `${t.version}|${ds.version}`;
