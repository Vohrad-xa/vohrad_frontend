import {Toggle} from '@/components/ui';
import {useHaptic} from '@/providers';
import {triggerHaptic} from '@/utils/haptics';

export function HapticToggle() {
  const {isEnabled, setEnabled} = useHaptic();

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    // Trigger a light haptic to demonstrate the feature when enabling
    if (value) {
      triggerHaptic('light');
    }
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
