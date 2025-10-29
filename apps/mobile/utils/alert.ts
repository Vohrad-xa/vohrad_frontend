import {Alert, Platform, Keyboard} from 'react-native';
import {triggerHaptic} from './haptics';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  cancelable?: boolean;
  hapticType?: 'error' | 'warning' | 'none';
}

export function showAlert({
  title,
  message,
  buttons = [{text: 'OK'}],
  cancelable = true,
  hapticType,
}: AlertOptions): void {
  // Auto-detect haptic type based on title if not specified
  if (!hapticType) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('error') || titleLower.includes('failed')) {
      hapticType = 'error';
    } else if (
      titleLower.includes('warning') ||
      titleLower.includes('confirm')
    ) {
      hapticType = 'warning';
    }
  }

  // Trigger haptic if applicable
  if (hapticType && hapticType !== 'none') {
    void triggerHaptic(hapticType);
  }
  if (Platform.OS === 'web') {
    if (buttons.length === 2) {
      const confirmed = window.confirm(
        message ? `${title}\n\n${message}` : title,
      );
      if (confirmed && buttons[1].onPress) {
        buttons[1].onPress();
      } else if (!confirmed && buttons[0].onPress) {
        buttons[0].onPress();
      }
    } else {
      window.alert(message ? `${title}\n\n${message}` : title);
      if (buttons[0].onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    Keyboard.dismiss();
    Alert.alert(title, message, buttons, {cancelable});
  }
}

export function showConfirmAlert({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  cancelIsDestructive = false,
}: {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
  cancelIsDestructive?: boolean;
}): void {
  showAlert({
    title,
    message,
    buttons: [
      {
        text: cancelText,
        style: cancelIsDestructive ? 'destructive' : 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ],
    cancelable: true,
  });
}
