import {Easing} from 'react-native-reanimated';

export const SIDEBAR_CONFIG = {
  width: 315,
  gestureEdgeWidth: 50,
  velocityThreshold: 1000,
  openThreshold: 0.4,
  closeThreshold: 220,
} as const;

export const SIDEBAR_ANIMATION = {
  toggle: {
    duration: 250,
    easing: Easing.out(Easing.cubic),
  },
  timing: {
    duration: 150,
    easing: Easing.inOut(Easing.ease),
  },
} as const;

export const BACKDROP_CONFIG = {
  maxOpacity: 0.9,
  zIndex: 999,
} as const;

export type SidebarConfig = typeof SIDEBAR_CONFIG;
export type SidebarAnimation = typeof SIDEBAR_ANIMATION;
export type BackdropConfig = typeof BACKDROP_CONFIG;
