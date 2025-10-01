import {Platform} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import {secureStorage} from '@/utils/secure-storage';

const SETTINGS_KEY = 'auth.biometric.settings';

type BiometricSettings = {
  enabled: boolean;
  declined: boolean;
  lastPromptAt?: number;
};

type BiometricAvailability = {
  available: boolean;
  reason?: 'UNSUPPORTED' | 'NO_HARDWARE' | 'NOT_ENROLLED';
};

export type BiometricAuthResult = {
  success: boolean;
  cancelled?: boolean;
  error?: string;
};

const DEFAULT_SETTINGS: BiometricSettings = {
  enabled: false,
  declined: false,
};

const PROMPT_COOLDOWN_MS = 60 * 1000;

// Retrieve persisted biometric settings from secure storage.
async function readSettings(): Promise<BiometricSettings> {
  const raw = await secureStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return {...DEFAULT_SETTINGS};
  }

  try {
    const parsed = JSON.parse(raw) as Partial<BiometricSettings>;
    return {...DEFAULT_SETTINGS, ...parsed};
  } catch {
    return {...DEFAULT_SETTINGS};
  }
}

// Persist biometric settings snapshot to secure storage.
async function writeSettings(next: BiometricSettings): Promise<void> {
  await secureStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

// Detect whether biometric hardware is available and enrolled.
async function checkAvailability(): Promise<BiometricAvailability> {
  if (Platform.OS === 'web') {
    return {available: false, reason: 'UNSUPPORTED'};
  }

  try {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    if (!hardware) {
      return {available: false, reason: 'NO_HARDWARE'};
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      return {available: false, reason: 'NOT_ENROLLED'};
    }

    return {available: true};
  } catch {
    return {available: false, reason: 'UNSUPPORTED'};
  }
}

// Check whether biometric unlock is currently enabled.
export async function isBiometricEnabled(): Promise<boolean> {
  const settings = await readSettings();
  return settings.enabled;
}

// Decide if the user should be prompted to enable biometrics post-login.
export async function shouldPromptEnable(): Promise<boolean> {
  const availability = await checkAvailability();
  if (!availability.available) {
    return false;
  }

  const settings = await readSettings();
  if (settings.enabled) {
    return false;
  }

  if (settings.lastPromptAt && Date.now() - settings.lastPromptAt < PROMPT_COOLDOWN_MS) {
    return false;
  }

  return true;
}

// Track that the user declined biometric opt-in.
export async function recordDecline(): Promise<void> {
  const settings = await readSettings();
  await writeSettings({...settings, enabled: false, declined: true, lastPromptAt: Date.now()});
}

// Attempt to enable biometrics, prompting the system sheet.
export async function enableWithAuthentication(promptMessage = 'Enable biometric authentication'): Promise<BiometricAuthResult> {
  const availability = await checkAvailability();
  if (!availability.available) {
    await disableBiometrics();
    return {success: false, error: availability.reason};
  }

  if (Platform.OS === 'web') {
    return {success: false, error: 'UNSUPPORTED'};
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    fallbackLabel: 'Use Passcode',
    disableDeviceFallback: false,
  });

  if (result.success) {
    const settings = await readSettings();
    await writeSettings({...settings, enabled: true, declined: false, lastPromptAt: Date.now()});
    return {success: true};
  }

  const errorCode = result.error as string | undefined;
  const cancelled = errorCode === 'user_cancel' || errorCode === 'system_cancel' || errorCode === 'app_cancel';
  const biometryLocked = errorCode === 'lockout';
  const notEnrolled = errorCode === 'not_enrolled';
  const error = biometryLocked ? 'LOCKED' : notEnrolled ? 'NOT_ENROLLED' : errorCode ?? 'unknown';
  if (notEnrolled) {
    await disableBiometrics();
  }
  return {success: false, cancelled, error};
}

// Disable biometric unlock and reset prompt cooldown.
export async function disableBiometrics(): Promise<void> {
  const settings = await readSettings();
  if (!settings.enabled && !settings.declined) {
    return;
  }
  await writeSettings({...settings, enabled: false, declined: false, lastPromptAt: Date.now()});
}

// Prompt for biometric unlock during app launch.
export async function authenticateWithBiometrics(promptMessage = 'Authenticate to continue'): Promise<BiometricAuthResult> {
  const availability = await checkAvailability();
  if (!availability.available) {
    await disableBiometrics();
    return {success: false, error: availability.reason};
  }

  if (Platform.OS === 'web') {
    return {success: false, error: 'UNSUPPORTED'};
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    fallbackLabel: 'Use Passcode',
    disableDeviceFallback: false,
  });

  if (result.success) {
    return {success: true};
  }

  const cancelled = result.error === 'user_cancel' || result.error === 'system_cancel' || result.error === 'app_cancel';
  return {success: false, cancelled, error: result.error};
}

// Determine if launch-time biometric gating is required.
export async function shouldRequireAuthenticationOnLaunch(): Promise<boolean> {
  const settings = await readSettings();
  if (!settings.enabled) {
    return false;
  }

  const availability = await checkAvailability();
  if (!availability.available) {
    await disableBiometrics();
    return false;
  }

  return true;
}

// Restore biometric settings to defaults.
export async function resetBiometricSettings(): Promise<void> {
  await writeSettings({...DEFAULT_SETTINGS});
}
