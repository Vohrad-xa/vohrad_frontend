/** View event type for native events */
export type ViewEvent<Name extends string, Data> = Record<
  Name,
  Data extends object
    ? ((event: {nativeEvent: Data}) => void) | undefined
    : (() => void) | undefined
>;

/** Frame properties for SwiftUI views */
export interface FrameProps {
  width?: number;
  height?: number;
  minWidth?: number;
  idealWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  idealHeight?: number;
  maxHeight?: number;
  alignment?:
    | 'center'
    | 'leading'
    | 'trailing'
    | 'top'
    | 'bottom'
    | 'topLeading'
    | 'topTrailing'
    | 'bottomLeading'
    | 'bottomTrailing';
}

/** Padding properties for SwiftUI views */
export interface PaddingProps {
  top?: number;
  leading?: number;
  bottom?: number;
  trailing?: number;
}

/** Common props for all SwiftUI views */
export interface CommonViewModifierProps {
  testID?: string;
  /** View modifiers applied in array order */
  modifiers?: Array<import('./modifiers').ViewModifier>;
}
