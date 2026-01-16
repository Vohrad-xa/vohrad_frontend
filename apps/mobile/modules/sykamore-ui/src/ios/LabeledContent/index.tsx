import {requireNativeView} from 'expo';

import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type LabeledContentProps = {
  label?: string | React.ReactNode;
  children: React.ReactNode;
} & CommonViewModifierProps;

const LabeledContentNativeView: React.ComponentType<LabeledContentProps> =
  requireNativeView('SykamoreUi', 'LabeledContentView');

const LabeledContentLabel: React.ComponentType<object> = requireNativeView(
  'SykamoreUi',
  'LabeledContentLabel',
);

const LabeledContentContent: React.ComponentType<object> = requireNativeView(
  'SykamoreUi',
  'LabeledContentContent',
);

export function LabeledContent(props: LabeledContentProps) {
  const {modifiers, label, children, ...restProps} = props;

  const isLabelString = typeof label === 'string';

  return (
    <LabeledContentNativeView
      modifiers={modifiers}
      label={isLabelString ? label : undefined}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...restProps}
    >
      {label && !isLabelString && (
        <LabeledContentLabel>{label}</LabeledContentLabel>
      )}
      <LabeledContentContent>{children}</LabeledContentContent>
    </LabeledContentNativeView>
  );
}
