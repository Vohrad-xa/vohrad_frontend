import {Toggle} from '@/components/ui';
import {useHaptic} from '@/providers';

export function HapticToggle() {
  const {isEnabled, setEnabled} = useHaptic();

  const handleToggle = (value: boolean) => {
    setEnabled(value);
  };

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
