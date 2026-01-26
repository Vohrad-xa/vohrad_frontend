import {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import CheckBox from '@react-native-community/checkbox';
import {List} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {
  Palette,
  type ThemePreference,
  themeKey,
  type DSShape,
  type ThemeShape,
} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

const OPTIONS = [
  {id: 'light', label: 'Light'},
  {id: 'dark', label: 'Dark'},
  {id: 'system', label: 'System'},
] as const satisfies ReadonlyArray<{id: ThemePreference; label: string}>;

const APPEARANCE_SHEET_NAME = 'appearance-sheet';

export const presentAppearanceSheet = async () => {
  await TrueSheet.present(APPEARANCE_SHEET_NAME);
};

export function AppearanceSheet() {
  const {preference, setScheme, ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const handleSelect = useCallback(
    (next: ThemePreference) => {
      if (next !== preference) {
        setScheme(next);
      }
      void TrueSheet.dismiss(APPEARANCE_SHEET_NAME);
    },
    [preference, setScheme],
  );

  return (
    <TrueSheet
      name={APPEARANCE_SHEET_NAME}
      sizes={['auto']}
      cornerRadius={ds.borderRadius.xxxl}
      backgroundColor={theme.modalBackground}
      contentContainerStyle={styles.container}
    >
      <ThemedText variant="headline">Appearance</ThemedText>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = preference === option.id;

          return (
            <List.Item
              key={option.id}
              title={option.label}
              onPress={() => handleSelect(option.id)}
              style={styles.optionRow}
              titleStyle={{color: theme.text}}
              rippleColor={theme.ripple}
              right={() => (
                <CheckBox
                  value={isSelected}
                  onValueChange={() => handleSelect(option.id)}
                  tintColors={{true: Palette.blue, false: Palette.mushroom}}
                />
              )}
              accessibilityRole="button"
              accessibilityState={{selected: isSelected}}
              borderless
            />
          );
        })}
      </View>
    </TrueSheet>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        paddingHorizontal: ds.spacing.lg,
        paddingVertical: ds.spacing.lg,
        gap: ds.spacing.md,
      },

      options: {
        gap: ds.spacing.sm,
      },

      optionRow: {
        paddingVertical: 0,
        paddingRight: ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
