import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Platform, StyleSheet, Switch as RNSwitch, View} from 'react-native';
import {ThemedText} from '@/components/ui';
import type {DesignSystem} from '@/constants/typography';
import {
  getBiometricAvailability,
  isBiometricEnabled,
  enableWithAuthentication,
  disableBiometrics,
  recordDecline,
  type BiometricAvailability,
} from '@/modules/security/biometric-service';
import {useTheme} from '@/providers';

type ThemeType = ReturnType<typeof useTheme>['theme'];

type BiometricStatus = {
  availability: BiometricAvailability;
  enabled: boolean;
};

const ENABLE_PROMPT_MESSAGE = 'Enable biometric unlock';

function resolveAvailabilityMessage(availability: BiometricAvailability): string | null {
  if (availability.available) {
    return null;
  }

  switch (availability.reason) {
    case 'NOT_ENROLLED':
      return 'Set up Face ID or Touch ID first.';
    case 'NO_HARDWARE':
      return 'Device has no biometric hardware.';
    case 'UNSUPPORTED':
    default:
      return 'Biometric unlock not available here.';
  }
}

function resolveEnableErrorMessage(errorCode?: string): {title: string; message: string} {
  switch (errorCode) {
    case 'LOCKED':
      return {
        title: 'Face ID Locked',
        message: 'Unlock with your passcode, then try again.',
      };
    case 'NOT_ENROLLED':
      return {
        title: 'Face ID Not Set Up',
        message: 'Enable Face ID or Touch ID in Settings first.',
      };
    case 'NO_HARDWARE':
      return {
        title: 'Unsupported Device',
        message: 'This device lacks biometric hardware.',
      };
    case 'UNSUPPORTED':
      return {
        title: 'Unsupported Platform',
        message: 'Biometric unlock is not supported here.',
      };
    default:
      return {
        title: 'Unable to Enable Biometrics',
        message: 'Biometric unlock failed. Check device settings.',
      };
  }
}

export function BiometricToggle() {
  const {ds, theme} = useTheme();
  const styles = useMemo(() => createStyles(ds, theme), [ds, theme]);
  const [status, setStatus] = useState<BiometricStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchStatus = useCallback(async (): Promise<BiometricStatus> => {
    const [availability, enabled] = await Promise.all([getBiometricAvailability(), isBiometricEnabled()]);
    if (!availability.available) {
      return {availability, enabled: false};
    }
    return {availability, enabled};
  }, []);

  const applyStatus = useCallback((next: BiometricStatus) => {
    if (!isMountedRef.current) {
      return;
    }
    setStatus(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchStatus();
        if (!cancelled) {
          applyStatus(next);
        }
      } finally {
        if (!cancelled && isMountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyStatus, fetchStatus]);

  const refreshStatus = useCallback(async () => {
    const next = await fetchStatus();
    applyStatus(next);
    return next;
  }, [applyStatus, fetchStatus]);

  const handleToggle = useCallback(
    async (nextValue: boolean) => {
      if (loading) {
        return;
      }

      setLoading(true);

      try {
        if (nextValue) {
          const result = await enableWithAuthentication(ENABLE_PROMPT_MESSAGE);
          if (!result.success) {
            if (!result.cancelled) {
              const {title, message} = resolveEnableErrorMessage(result.error);
              Alert.alert(title, message);
            }
            await refreshStatus().catch((error) => {
              console.error('[BiometricToggle] Failed to refresh status after enable failure:', error);
            });
            return;
          }
        } else {
          try {
            await disableBiometrics();
            await recordDecline();
          } catch (error) {
            console.error('[BiometricToggle] Failed to disable biometrics:', error);
          }
        }

        await refreshStatus().catch((error) => {
          console.error('[BiometricToggle] Failed to refresh status:', error);
        });
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [loading, refreshStatus],
  );

  const availability = status?.availability ?? {available: false, reason: undefined};
  const isAvailable = availability.available;
  const isEnabled = status?.enabled ?? false;
  const availabilityMessage = loading ? null : resolveAvailabilityMessage(availability);

  return (
    <View style={styles.container}>
      {availabilityMessage && (
        <ThemedText style={styles.message} accessibilityRole="text">
          {availabilityMessage}
        </ThemedText>
      )}
      <RNSwitch
        value={isEnabled}
        onValueChange={handleToggle}
        disabled={loading || !isAvailable}
        trackColor={{false: theme.divider, true: theme.accent}}
        thumbColor={Platform.OS === 'android' ? (isEnabled ? theme.accent : theme.input) : undefined}
        ios_backgroundColor={theme.divider}
        accessibilityRole="switch"
        accessibilityState={{disabled: loading || !isAvailable, checked: isEnabled}}
        accessibilityLabel="Biometric unlock"
        testID="settings-biometric-toggle"
      />
    </View>
  );
}

export default BiometricToggle;

function createStyles(ds: typeof DesignSystem, theme: ThemeType) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    message: {
      ...ds.typography.secondary,
      color: theme.muted,
      marginRight: ds.spacing.sm,
      maxWidth: ds.spacing.xxxl * 3,
    },
  });
}
