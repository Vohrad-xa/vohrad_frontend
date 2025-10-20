import {Platform} from 'react-native';
import * as Haptics from 'expo-haptics';
import {getItem, setItem} from './storage';

export type HapticType =
  | 'success'
  | 'warning'
  | 'error'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection';

let isHapticsEnabled = true;

const HAPTICS_STORAGE_KEY = 'haptics-enabled';

export async function loadHapticsPreference(): Promise<boolean | null> {
  try {
    const stored = await getItem(HAPTICS_STORAGE_KEY);
    if (stored == null) {
      return null;
    }
    return stored === 'true';
  } catch (error) {
    console.warn('[haptics] Failed to load haptic preference:', error);
    return null;
  }
}

export async function persistHapticsPreference(
  enabled: boolean,
): Promise<void> {
  try {
    await setItem(HAPTICS_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.warn('[haptics] Failed to persist haptic preference:', error);
  }
}

// Set haptic preference
export function setHapticsEnabled(enabled: boolean): void {
  isHapticsEnabled = enabled;
}

// Get current haptic preference
export function getHapticsEnabled(): boolean {
  return isHapticsEnabled;
}

export function triggerHaptic(type: HapticType = 'light'): void {
  if (!isHapticsEnabled || Platform.OS === 'web') {
    return;
  }

  void (async () => {
    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          break;
        case 'warning':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
          break;
        case 'error':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        default:
          await Haptics.selectionAsync();
      }
    } catch (error) {
      console.warn('[haptics] Failed to trigger haptic:', error);
    }
  })();
}
