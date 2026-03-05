import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import {View} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {List, Switch} from 'react-native-paper';
import {Palette} from '@/constants';
import {useTheme} from '@/providers';
import {useDashboardCardControls} from '../hooks';

export type CardsFilterSheetHandle = {
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
};

export const CardsFilterSheet = forwardRef<CardsFilterSheetHandle>((_, ref) => {
  const sheetRef = useRef<TrueSheet>(null);
  const {theme} = useTheme();
  const {visibility, setCardVisibility, cardConfig} =
    useDashboardCardControls();

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
      detents={['auto']}
      backgroundColor={theme.modalBackground}
    >
      <View>
        <List.Section>
          {cardConfig.map((card) => {
            const visibilityKey = card.key;
            const isVisible = !!visibility[visibilityKey];

            return (
              <React.Fragment key={visibilityKey}>
                <List.Item
                  title={card.title}
                  accessibilityLabel={`Toggle ${card.title} card`}
                  left={(props) => <List.Icon {...props} icon={card.icon} />}
                  right={() => (
                    <Switch
                      color={Palette.bluepurple}
                      value={isVisible}
                      onValueChange={(value) =>
                        setCardVisibility(visibilityKey, value)
                      }
                    />
                  )}
                />
              </React.Fragment>
            );
          })}
        </List.Section>
      </View>
    </TrueSheet>
  );
});
CardsFilterSheet.displayName = 'CardsFilterSheet';
