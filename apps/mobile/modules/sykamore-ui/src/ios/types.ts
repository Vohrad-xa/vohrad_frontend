export interface CommonViewModifierProps {
  /**
   * Used to locate this view in end-to-end tests.
   */
  testID?: string;

  /**
   * Array of view modifiers to apply to this view.
   * Modifiers are applied in the order they appear in the array.
   *
   * @example
   * ```tsx
   * import { background, cornerRadius, shadow, frame, padding, fixedSize } from 'expo-ui/swift-ui/modifiers';
   *
   * <Text modifiers={[
   *   background('#FF0000'),
   *   cornerRadius(10),
   *   padding({ all: 16 }),
   *   frame({ width: 200 }),
   *   shadow({ radius: 5, x: 0, y: 2 })
   * ]}>
   *   Hello World
   * </Text>
   * ```
   */
  modifiers?: import('./modifiers').ViewModifier[];
}
