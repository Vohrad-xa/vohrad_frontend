import {requireNativeView} from 'expo';

const RNHostNativeView: React.ComponentType<any> = requireNativeView(
  'SykamoreUi',
  'RNHostView',
);

interface RNHostViewProps {
  matchContents?: boolean;
  children: React.ReactElement;
}

export function RNHostView(props: RNHostViewProps) {
  return (
    <RNHostNativeView
      {...props}
      // `matchContents` can only be used once on mount
      // So we force unmount when it changes to prevent unexpected layout
      key={props.matchContents ? 'matchContents' : 'noMatchContents'}
    />
  );
}
