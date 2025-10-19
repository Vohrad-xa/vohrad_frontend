import {Alert, Platform} from 'react-native';

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
}

export function showAlert({
  title,
  message,
  buttons = [{text: 'OK'}],
  cancelable = true,
}: AlertOptions): void {
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
