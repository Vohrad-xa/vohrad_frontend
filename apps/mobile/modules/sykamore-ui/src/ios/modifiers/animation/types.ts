import type {ANIMATION_TYPES} from './constants';

export type AnimationType = (typeof ANIMATION_TYPES)[number];

export type AnimationConfig =
  | {
      type: 'easeInOut' | 'easeIn' | 'easeOut' | 'linear' | 'default';
      duration?: number;
      delay?: number;
      repeatCount?: number;
      autoreverses?: boolean;
    }
  | {
      type: 'spring';
      duration?: number;
      bounce?: number;
      blendDuration?: number;
      delay?: number;
      repeatCount?: number;
      autoreverses?: boolean;
      dampingFraction?: number;
      response?: number;
    }
  | {
      type: 'interpolatingSpring';
      duration?: number;
      bounce?: number;
      blendDuration?: number;
      delay?: number;
      repeatCount?: number;
      autoreverses?: boolean;
      mass?: number;
      stiffness?: number;
      damping?: number;
      initialVelocity?: number;
    };
