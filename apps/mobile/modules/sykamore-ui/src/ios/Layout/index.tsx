import {requireNativeView} from 'expo';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

interface StackBaseProps extends CommonViewModifierProps {
  children: React.ReactNode;
  spacing?: number;
}

function transformNativeProps(props: StackBaseProps) {
  const {modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
  };
}

//#region HStack Component
export interface HStackProps extends StackBaseProps {
  alignment?:
    | 'top'
    | 'center'
    | 'bottom'
    | 'firstTextBaseline'
    | 'lastTextBaseline';
}

const HStackNativeView: React.ComponentType<HStackProps> = requireNativeView(
  'SykamoreUi',
  'HStackView',
);

export function HStack(props: HStackProps) {
  return <HStackNativeView {...transformNativeProps(props)} />;
}
//#endregion

//#region VStack Component
export interface VStackProps extends StackBaseProps {
  alignment?: 'leading' | 'center' | 'trailing';
}

const VStackNativeView: React.ComponentType<VStackProps> = requireNativeView(
  'SykamoreUi',
  'VStackView',
);

export function VStack(props: VStackProps) {
  return <VStackNativeView {...transformNativeProps(props)} />;
}
//#endregion

//#region Group Component
export interface GroupProps extends CommonViewModifierProps {
  children: React.ReactNode;
}

const GroupNativeView: React.ComponentType<GroupProps> = requireNativeView(
  'SykamoreUi',
  'GroupView',
);

function transformGroupProps(props: GroupProps) {
  const {modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
  };
}

export function Group(props: GroupProps) {
  return <GroupNativeView {...transformGroupProps(props)} />;
}
//#endregion

//#region ZStack Component
export interface ZStackProps extends StackBaseProps {
  alignment?:
    | 'center'
    | 'leading'
    | 'trailing'
    | 'top'
    | 'bottom'
    | 'topLeading'
    | 'topTrailing'
    | 'bottomLeading'
    | 'bottomTrailing'
    | 'centerFirstTextBaseline'
    | 'centerLastTextBaseline'
    | 'leadingFirstTextBaseline'
    | 'leadingLastTextBaseline'
    | 'trailingFirstTextBaseline'
    | 'trailingLastTextBaseline';
}

const ZStackNativeView: React.ComponentType<ZStackProps> = requireNativeView(
  'SykamoreUi',
  'ZStackView',
);

export function ZStack(props: ZStackProps) {
  return <ZStackNativeView {...transformNativeProps(props)} />;
}
//#endregion
