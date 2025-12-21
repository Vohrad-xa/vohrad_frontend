import {requireNativeView} from 'expo';
import {type SFSymbol} from 'sf-symbols-typescript';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export interface ContentUnavailableViewProps extends CommonViewModifierProps {
  title?: string;
  systemImage?: SFSymbol;
  description?: string;
}

const ContentUnavailableViewNativeView: React.ComponentType<ContentUnavailableViewProps> =
  requireNativeView('SykamoreUi', 'ContentUnavailableView');

function transformContentUnavailableViewProps(
  props: ContentUnavailableViewProps,
): ContentUnavailableViewProps {
  const {modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
  };
}

/**
 * Displays a native Swift UI ContentUnavailableView.
 * @platform ios 17.0+
 * @platform tvos 17.0+
 */
export function ContentUnavailableView(props: ContentUnavailableViewProps) {
  return (
    <ContentUnavailableViewNativeView
      {...transformContentUnavailableViewProps(props)}
    />
  );
}
