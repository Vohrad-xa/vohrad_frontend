import {Platform} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {ListRow, ListRows} from '@/components/ui';
import {BiometricToggle, HapticToggle} from '@/features/settings';
import {useTheme} from '@/providers';

export default function AppSettingsScreen() {
  const {ds, theme} = useTheme();

  return (
    <ScrollView contentContainerStyle={{padding: ds.spacing.md}}>
      <ListRows>
        <ListRow
          rowKey="biometric"
          title="Biometric Unlock"
          description="Enable Face ID / Fingerprint"
          right={() => <BiometricToggle />}
          a11yLabel="Biometric Unlock"
          a11yHint="Toggle biometric authentication"
        />

        {Platform.OS !== 'web' && (
          <ListRow
            rowKey="haptic"
            title="Haptic Feedback"
            description="Enable haptic feedback"
            right={() => <HapticToggle />}
            a11yLabel="Haptic Feedback"
            a11yHint="Toggle haptic feedback"
          />
        )}
      </ListRows>
    </ScrollView>
  );
}
