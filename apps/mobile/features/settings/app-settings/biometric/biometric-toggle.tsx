import {Platform, StyleSheet, View} from 'react-native';
import {ThemedText, Toggle} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {Switch} from 'sykamore-ui/android';
import {useBiometricToggle} from './use-biometric-toggle';

export function BiometricToggle() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {isEnabled, isAvailable, loading, availabilityMessage, handleToggle} =
    useBiometricToggle();

  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        {availabilityMessage && (
          <ThemedText style={styles.message} accessibilityRole="text">
            {availabilityMessage}
          </ThemedText>
        )}
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          variant="switch"
          scale={0.8}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {availabilityMessage && (
        <ThemedText style={styles.message} accessibilityRole="text">
          {availabilityMessage}
        </ThemedText>
      )}
      <Toggle
        value={isEnabled}
        onValueChange={handleToggle}
        disabled={loading || !isAvailable}
        accessibilityLabel="Biometric unlock"
        testID="settings-biometric-toggle"
      />
    </View>
  );
}

export default BiometricToggle;

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      message: {
        ...ds.typography.secondary,
        color: theme.muted,
        marginRight: ds.spacing.sm,
        flexShrink: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
