import {useCallback, useMemo, useState, type ReactElement} from 'react';
import {Platform} from 'react-native';
import {Snackbar} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '@/providers';

type UseAttachmentsSnackbarResult = {
  showSnack: (message: string) => void;
  snackbar: ReactElement;
};

/**
 * Attachments snackbar helper for selection actions (share/delete).
 */
export function useAttachmentsSnackbar(): UseAttachmentsSnackbarResult {
  const insets = useSafeAreaInsets();
  const {ds} = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnack = useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const dismissSnack = useCallback(() => {
    setSnackbarVisible(false);
  }, []);

  const wrapperStyle = useMemo(
    () =>
      Platform.OS === 'ios'
        ? {bottom: insets.bottom + ds.spacing.md}
        : undefined,
    [ds.spacing.md, insets.bottom],
  );

  const snackbar = (
    <Snackbar
      visible={snackbarVisible}
      wrapperStyle={wrapperStyle}
      onDismiss={dismissSnack}
      duration={3000}
      style={{borderRadius: ds.borderRadius.full}}
      action={{label: 'OK', onPress: dismissSnack}}
    >
      {snackbarMessage}
    </Snackbar>
  );

  return {showSnack, snackbar};
}
