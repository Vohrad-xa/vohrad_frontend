export const ANIMATION_TYPES = [
  'easeInOut',
  'easeIn',
  'easeOut',
  'linear',
  'spring',
  'interpolatingSpring',
  'default',
] as const;

export const DEFAULT_SPRING_VALUES = {
  duration: 0.5,
  bounce: 0,
  blendDuration: 0,
  mass: 1,
  stiffness: 100,
  damping: 10,
  initialVelocity: 0,
};
