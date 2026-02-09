import {requireNativeView} from 'expo';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type SectionProps = {
  title?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  /**
   * When provided, the section becomes collapsible.
   * > **Note**: Available only when the list style is set to `sidebar`.
   */
  isExpanded?: boolean;
  onIsExpandedChange?: (isExpanded: boolean) => void;
} & CommonViewModifierProps;

type SectionNativeProps = Omit<SectionProps, 'onIsExpandedChange'> & {
  onIsExpandedChange?: (e: {nativeEvent: {isExpanded: boolean}}) => void;
};

const SectionNativeView: React.ComponentType<SectionNativeProps> =
  requireNativeView('SykamoreUi', 'SectionView');

const SectionHeader: React.ComponentType<object> = requireNativeView(
  'SykamoreUi',
  'SectionHeader',
);

const SectionFooter: React.ComponentType<object> = requireNativeView(
  'SykamoreUi',
  'SectionFooter',
);

const SectionContent: React.ComponentType<object> = requireNativeView(
  'SykamoreUi',
  'SectionContent',
);

/**
 * Section component uses the native section component.
 */
export function Section(props: SectionProps) {
  const {
    modifiers,
    header,
    footer,
    children,
    onIsExpandedChange,
    ...restProps
  } = props;
  return (
    <SectionNativeView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...(onIsExpandedChange && {
        onIsExpandedChange: (e: {nativeEvent: {isExpanded: boolean}}) =>
          onIsExpandedChange(e.nativeEvent.isExpanded),
      })}
      {...restProps}
    >
      {header && <SectionHeader>{header}</SectionHeader>}
      {footer && <SectionFooter>{footer}</SectionFooter>}
      <SectionContent>{children}</SectionContent>
    </SectionNativeView>
  );
}
