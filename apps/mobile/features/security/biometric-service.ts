import {Platform} from 'react-native';
import {parseJson, validateBiometricSettingsSnapshot} from '@sykamore/types';
import * as LocalAuthentication from 'expo-local-authentication';
import {secureStorage} from '@/utils/secure-storage';

const SETTINGS_KEY = 'auth.biometric.settings';

type BiometricSettings = {
  enabled: boolean;
  declined: boolean;
  lastPromptAt?: number;
};

export type BiometricUnavailableReason =
  | 'UNSUPPORTED'
  | 'NO_HARDWARE'
  | 'NOT_ENROLLED';
export type BiometricAuthError =
  | BiometricUnavailableReason
  | 'LOCKED'
  | 'unknown';

export type BiometricAvailability = {
  available: boolean;

  reason?: BiometricUnavailableReason;
};

export type BiometricAuthResult = {
  success: boolean;
  cancelled?: boolean;
  error?: BiometricAuthError;
};

const DEFAULT_SETTINGS: BiometricSettings = {
  enabled: false,
  declined: false,
};

const PROMPT_COOLDOWN_MS = 60 * 1000; // Avoid nagging the user too frequently
const CANCELLED_ERROR_CODES = new Set([
  'user_cancel',
  'system_cancel',
  'app_cancel',
  'user_fallback',
]);
const AUTH_PROMPT_BASE_OPTIONS = {
  cancelLabel: 'Cancel',
  fallbackLabel: 'Use Passcode',
  disableDeviceFallback: false,
} as const;

// Retrieve persisted biometric settings from secure storage.
async function readSettings(): Promise<BiometricSettings> {
  const raw = await secureStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return {...DEFAULT_SETTINGS};
  }

  try {
    const parsedResult = parseJson(raw);
    if (!parsedResult.success) {
      return {...DEFAULT_SETTINGS};
    }

    const settingsResult = validateBiometricSettingsSnapshot(parsedResult.data);
    if (!settingsResult.success) {
      return {...DEFAULT_SETTINGS};
    }

    return {...DEFAULT_SETTINGS, ...settingsResult.data};
  } catch {
    return {...DEFAULT_SETTINGS};
  }
}

// Persist biometric settings snapshot to secure storage.
async function writeSettings(next: BiometricSettings): Promise<void> {
  await secureStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

function mapAuthError(errorCode?: string | null): BiometricAuthError {
  switch (errorCode) {
    case 'lockout':
    case 'lockout_permanent':
      return 'LOCKED';
    case 'not_enrolled':
    case 'biometry_not_enrolled':
      return 'NOT_ENROLLED';
    case 'not_available':
    case 'hardware_not_available':
      return 'NO_HARDWARE';
    case 'not_supported':
    case 'platform_not_supported':
      return 'UNSUPPORTED';
    case undefined:
    case null:
      return 'unknown';
    default:
      return 'unknown';
  }
}

function wasCancelled(errorCode?: string | null): boolean {
  if (!errorCode) {
    return false;
  }
  return CANCELLED_ERROR_CODES.has(errorCode);
}

async function performAuthentication(promptMessage: string) {
  return LocalAuthentication.authenticateAsync({
    ...AUTH_PROMPT_BASE_OPTIONS,
    promptMessage,
  });
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

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  return checkAvailability();
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
  if (settings.enabled || settings.declined) {
    return false;
  }

  const now = Date.now();
  if (
    settings.lastPromptAt &&
    now - settings.lastPromptAt < PROMPT_COOLDOWN_MS
  ) {
    return false;
  }

  await writeSettings({...settings, lastPromptAt: now});
  return true;
}

// Track that the user declined biometric opt-in.
export async function recordDecline(): Promise<void> {
  const settings = await readSettings();
  await writeSettings({
    ...settings,
    enabled: false,
    declined: true,
    lastPromptAt: Date.now(),
  });
}

// Attempt to enable biometrics, prompting the system sheet.
export async function enableWithAuthentication(
  promptMessage = 'Enable biometric authentication',
): Promise<BiometricAuthResult> {
  const availability = await checkAvailability();
  if (!availability.available) {
    await disableBiometrics();
    return {success: false, error: availability.reason ?? 'UNSUPPORTED'};
  }

  if (Platform.OS === 'web') {
    await disableBiometrics();
    return {success: false, error: 'UNSUPPORTED'};
  }

  const result = await performAuthentication(promptMessage);

  if (result.success) {
    const settings = await readSettings();
    await writeSettings({
      ...settings,
      enabled: true,
      declined: false,
      lastPromptAt: Date.now(),
    });
    return {success: true};
  }

  const errorCode = result.error as string | undefined;
  const cancelled = wasCancelled(errorCode);
  const error = mapAuthError(errorCode);

  if (error === 'NOT_ENROLLED') {
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
  await writeSettings({
    ...settings,
    enabled: false,
    declined: false,
    lastPromptAt: Date.now(),
  });
}

// Prompt for biometric unlock during app launch.
export async function authenticateWithBiometrics(
  promptMessage = 'Authenticate to continue',
): Promise<BiometricAuthResult> {
  const availability = await checkAvailability();
  if (!availability.available) {
    await disableBiometrics();
    return {success: false, error: availability.reason ?? 'UNSUPPORTED'};
  }

  if (Platform.OS === 'web') {
    await disableBiometrics();
    return {success: false, error: 'UNSUPPORTED'};
  }

  const result = await performAuthentication(promptMessage);

  if (result.success) {
    return {success: true};
  }

  const errorCode = result.error as string | undefined;
  const cancelled = wasCancelled(errorCode);
  const error = mapAuthError(errorCode);

  return {success: false, cancelled, error};
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
