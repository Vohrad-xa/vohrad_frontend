import {requireNativeView} from 'expo';
import {type ViewEvent} from '../../types';
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

//#region DisclosureGroup Component
export interface DisclosureGroupProps extends CommonViewModifierProps {
  label: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  onIsExpandedChange?: (isExpanded: boolean) => void;
}

type DisclosureGroupStateChangeEvent = ViewEvent<
  'onIsExpandedChange',
  {isExpanded: boolean}
>;

type NativeDisclosureGroupProps = Omit<
  DisclosureGroupProps,
  'onIsExpandedChange'
> &
  DisclosureGroupStateChangeEvent;

const DisclosureGroupNativeView: React.ComponentType<NativeDisclosureGroupProps> =
  requireNativeView('SykamoreUi', 'DisclosureGroupView');

export function DisclosureGroup(props: DisclosureGroupProps) {
  const {onIsExpandedChange, modifiers, ...rest} = props;

  const transformedProps = {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...rest,
  };

  return (
    <DisclosureGroupNativeView
      {...transformedProps}
      onIsExpandedChange={(event: {nativeEvent: {isExpanded: boolean}}) =>
        onIsExpandedChange?.(event.nativeEvent.isExpanded)
      }
    />
  );
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
