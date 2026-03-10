import {useCallback, useState, type ReactElement} from 'react';
import {Snackbar} from 'react-native-paper';
import {useTypography} from '@/constants';
import {useTheme} from '@/providers';

type ShowSnackOptions = Readonly<{
  duration?: number;
}>;

export type UseSnackbarResult = {
  showSnack: (message: string, options?: ShowSnackOptions) => void;
  snackbar: ReactElement;
};

const DEFAULT_DURATION = 3000;

export function useSnackbar(): UseSnackbarResult {
  const {ds, theme} = useTheme();
  const typography = useTypography();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarDuration, setSnackbarDuration] = useState(DEFAULT_DURATION);

  const showSnack = useCallback(
    (message: string, options?: ShowSnackOptions) => {
      setSnackbarMessage(message);
      setSnackbarDuration(options?.duration ?? DEFAULT_DURATION);
      setSnackbarVisible(true);
    },
    [],
  );

  const dismissSnack = useCallback(() => {
    setSnackbarVisible(false);
  }, []);

  const snackbar = (
    <Snackbar
      visible={snackbarVisible}
      onDismiss={dismissSnack}
      duration={snackbarDuration}
      role="alertdialog"
      elevation={0}
      wrapperStyle={{
        bottom: ds.spacing.md,
      }}
      style={{
        marginHorizontal: ds.spacing.xl,
        borderRadius: ds.borderRadius.full,
        borderColor: theme.offWhite,
        borderWidth: 1,
        ...ds.shadows.lg,
      }}
      action={{
        label: 'OK',
        onPress: dismissSnack,
        labelStyle: typography.subheadline,
      }}
    >
      {snackbarMessage}
    </Snackbar>
  );

  return {showSnack, snackbar};
}
