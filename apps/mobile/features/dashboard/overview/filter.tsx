import {forwardRef, useCallback, useImperativeHandle, useRef} from 'react';
import {StyleSheet, Platform, View} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {HelperText} from 'react-native-paper';
import {ListRow, ListRows} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {Icon, makeStyleFactory} from '@/utils';
import {Switch as AndroidSwitch} from 'sykamore-ui/android';
import {
  Host,
  List as IOSList,
  Toggle as IOSToggle,
  Section,
  Text,
} from 'sykamore-ui/ios';
import {useDashboardCardControls} from './filter-context';

export type CardsFilterSheetHandle = {
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
};

export const CardsFilterSheet = forwardRef<CardsFilterSheetHandle>((_, ref) => {
  const sheetRef = useRef<TrueSheet>(null);
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
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
      detents={Platform.OS === 'ios' ? [0.47, 1] : [0.57, 1]}
      scrollable
      backgroundColor={
        Platform.OS === 'ios' ? undefined : theme.modalBackground
      }
      style={styles.sheet}
    >
      {Platform.OS === 'ios' ? (
        <Host style={styles.contentContainer} useViewportSizeMeasurement>
          <IOSList listStyle="automatic">
            <Section
              footer={
                <Text modifiers={[]}>
                  You can choose which overview cards are displayed on your
                  dashboard.
                </Text>
              }
            >
              {cardConfig.map((card) => {
                const visibilityKey = card.key;
                const isVisible = visibility[visibilityKey];

                return (
                  <IOSToggle
                    key={visibilityKey}
                    isOn={isVisible}
                    onIsOnChange={(value) =>
                      setCardVisibility(visibilityKey, value)
                    }
                    label={card.title}
                    systemImage={card.icon}
                  />
                );
              })}
            </Section>
          </IOSList>
        </Host>
      ) : (
        <View style={styles.contentContainer}>
          <ListRows>
            {cardConfig.map((card) => {
              const visibilityKey = card.key;
              const isVisible = visibility[visibilityKey];

              return (
                <ListRow
                  key={visibilityKey}
                  rowKey={visibilityKey}
                  title={card.title}
                  a11yLabel={`Toggle ${card.title} card`}
                  a11yHint={`Show or hide ${card.title} on dashboard`}
                  left={(props) => (
                    <Icon name={card.icon} style={props.style} />
                  )}
                  right={() => (
                    <AndroidSwitch
                      value={isVisible}
                      onValueChange={(value) =>
                        setCardVisibility(visibilityKey, value)
                      }
                      variant="switch"
                      scale={0.85}
                    />
                  )}
                  style={styles.itemList}
                />
              );
            })}
          </ListRows>
          <HelperText type="info" variant="bodyMedium">
            You can choose which overview cards are displayed on your dashboard.
          </HelperText>
        </View>
      )}
    </TrueSheet>
  );
});
CardsFilterSheet.displayName = 'CardsFilterSheet';

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      sheet: {
        paddingVertical: Platform.OS === 'android' ? ds.spacing.lg : undefined,
      },

      contentContainer: {
        flex: 1,
        padding: ds.spacing.md,
      },

      itemList: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    }),
  (ds, _theme) => themeKey(_theme, ds),
);
