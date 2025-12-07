import {requireNativeView} from 'expo';

import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type SectionProps = {
  title?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
} & CommonViewModifierProps;

const SectionNativeView: React.ComponentType<SectionProps> = requireNativeView(
  'SykamoreUi',
  'SectionView',
);

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

export function Section(props: SectionProps) {
  const {modifiers, header, footer, children, ...restProps} = props;
  return (
    <SectionNativeView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...restProps}
    >
      {header && <SectionHeader>{header}</SectionHeader>}
      {footer && <SectionFooter>{footer}</SectionFooter>}
      <SectionContent>{children}</SectionContent>
    </SectionNativeView>
  );
}
