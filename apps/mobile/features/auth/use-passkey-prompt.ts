import {useCallback} from 'react';
import {Alert, Platform} from 'react-native';
import * as AppStorage from '@/utils/storage';

const PASSKEY_PROMPT_KEY_PREFIX = 'passkey_prompted_v3';

/**
 * Prompts the user once (per platform) to opt into passkey setup during sign-in.
 * Returns `true` if the user accepted, `false` otherwise.
 * Uses a persisted flag so the prompt is shown at most once.
 */
export function usePasskeyPrompt() {
  const resolvePasskeySetupChoice = useCallback(async (): Promise<boolean> => {
    const promptKey = `${PASSKEY_PROMPT_KEY_PREFIX}:${Platform.OS}`;
    const alreadyPrompted = await AppStorage.getItem(promptKey);
    if (alreadyPrompted === '1') return false;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const accepted = window.confirm(
        'Set up passkey during this sign-in for faster future logins?',
      );
      if (accepted) await AppStorage.setItem(promptKey, '1');
      return accepted;
    }

    const accepted = await new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (value: boolean) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      Alert.alert(
        'Set up passkey?',
        'Set up passkey during this sign-in for faster future logins.',
        [
          {text: 'Not now', style: 'cancel', onPress: () => finish(false)},
          {text: 'Set up now', onPress: () => finish(true)},
        ],
        {cancelable: true, onDismiss: () => finish(false)},
      );
    });

    if (accepted) await AppStorage.setItem(promptKey, '1');
    return accepted;
  }, []);

  return {resolvePasskeySetupChoice};
}
