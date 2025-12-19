import {Platform} from 'react-native';
import {Toggle} from '@/components/ui';
import {Switch} from '@/modules/sykamore-ui/src/android';
import {useHaptic} from '@/providers';

export function HapticToggle() {
  const {isEnabled, setEnabled} = useHaptic();

  const handleToggle = (value: boolean) => {
    setEnabled(value);
  };

  if (Platform.OS === 'android') {
    return (
      <Switch
        value={isEnabled}
        onValueChange={handleToggle}
        variant="switch"
        scale={0.8}
      />
    );
  }

  return (
    <Toggle
      value={isEnabled}
      onValueChange={handleToggle}
      accessibilityLabel="Haptic feedback"
      testID="settings-haptic-toggle"
    />
  );
}

export default HapticToggle;
