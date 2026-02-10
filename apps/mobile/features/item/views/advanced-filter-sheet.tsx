import {forwardRef, useCallback, useImperativeHandle, useRef} from 'react';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useTheme} from '@/providers';

export type AdvancedFilterSheetHandle = {
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
};

export const AdvancedFilterSheet = forwardRef<AdvancedFilterSheetHandle>(
  (_props, ref) => {
    const sheetRef = useRef<TrueSheet>(null);
    const {theme} = useTheme();

    const handlePresent = useCallback(async () => {
      await sheetRef.current?.present();
    }, []);

    const handleDismiss = useCallback(async () => {
      await sheetRef.current?.dismiss();
    }, []);

    useImperativeHandle(
      ref,
      () => ({present: handlePresent, dismiss: handleDismiss}),
      [handlePresent, handleDismiss],
    );

    return (
      <TrueSheet
        ref={sheetRef}
        backgroundColor={theme.modalBackground}
        scrollable
      />
    );
  },
);

AdvancedFilterSheet.displayName = 'AdvancedFilterSheet';
