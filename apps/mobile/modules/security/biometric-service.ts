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


