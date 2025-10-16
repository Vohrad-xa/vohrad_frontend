import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {ThemedText, Toggle} from '@/components/ui';
import {
  getBiometricAvailability,
  isBiometricEnabled,
  enableWithAuthentication,
  disableBiometrics,
  recordDecline,
  type BiometricAvailability,
} from '@/modules/security/biometric-service';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';

type BiometricStatus = {
  availability: BiometricAvailability;
  enabled: boolean;
};

const ENABLE_PROMPT_MESSAGE = 'Enable biometric unlock';

function resolveAvailabilityMessage(
  availability: BiometricAvailability,
): string | null {
  if (availability.available) {
    return null;
  }

  switch (availability.reason) {
    case 'NOT_ENROLLED':
      return 'Inactive';
    case 'NO_HARDWARE':
      return 'Unavailable.';
    case 'UNSUPPORTED':
    default:
      return 'Unavailable.';
  }
}

function resolveEnableErrorMessage(errorCode?: string): {
  title: string;
  message: string;
} {
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
  const styles = createStyles(ds, theme);
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
    const [availability, enabled] = await Promise.all([
      getBiometricAvailability(),
      isBiometricEnabled(),
    ]);
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
              console.error(
                '[BiometricToggle] Failed to refresh status after enable failure:',
                error,
              );
            });
            return;
          }
        } else {
          try {
            await disableBiometrics();
            await recordDecline();
          } catch (error) {
            console.error(
              '[BiometricToggle] Failed to disable biometrics:',
              error,
            );
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

  const availability = status?.availability ?? {
    available: false,
    reason: undefined,
  };
  const isAvailable = availability.available;
  const isEnabled = status?.enabled ?? false;
  const availabilityMessage = loading
    ? null
    : resolveAvailabilityMessage(availability);

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
