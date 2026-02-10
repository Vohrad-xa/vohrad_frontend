import {Platform} from 'react-native';
import {Toggle} from '@/components/ui';
import {useHaptic} from '@/providers';
import {Switch} from 'sykamore-ui/android';

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
        scale={0.85}
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
