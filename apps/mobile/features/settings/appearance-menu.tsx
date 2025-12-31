import React, {useMemo} from 'react';
import {Platform, type StyleProp, type ViewStyle, View} from 'react-native';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {ThemedText} from '@/components/ui';
import type {ThemePreference} from '@/constants';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {AppIcons, Icon, makeStyleFactory} from '@/utils';
import {Button, Host, Picker, pickerStyle} from 'sykamore-ui/ios';

/**
 * Appearance options shown to the user (id = stored value, label = UI text).
 */
const SCHEMES = [
  {id: 'light', label: 'Light'},
  {id: 'dark', label: 'Dark'},
  {id: 'system', label: 'System'},
] as const satisfies ReadonlyArray<{id: ThemePreference; label: string}>;

/**
 * Native events are typed broadly (string / string|number), so we validate before saving.
 */
const isThemePreference = (v: unknown): v is ThemePreference =>
  v === 'light' || v === 'dark' || v === 'system';

type AppearanceMenuProps = {
  /**
   * Style for the trigger view (the Pressable).
   * Accepts RN style objects, arrays, registered styles, etc.
   */
  style?: StyleProp<ViewStyle>;
};

/**
 * Appearance selector.
 *
 * - iOS: SwiftUI Picker (menu style) via `sykamore-ui/ios`.
 * - Android: `SykaMenuView` native contextual menu.
 */
export function AppearanceMenu({style}: AppearanceMenuProps) {
  const {preference, setScheme, ds, theme} = useTheme();

  /**
   * Current selection (falls back to 'system' if something unexpected ever happens).
   */
  const selected = SCHEMES.find((s) => s.id === preference) ?? SCHEMES[2];

  /**
   * Android menu actions. `state: 'on'` shows the checkmark for the selected item.
   */
  const actions = useMemo(
    () =>
      SCHEMES.map(
        (s): SykaMenuAction => ({
          id: s.id,
          title: s.label,
          state: preference === s.id ? 'on' : undefined,
        }),
      ),
    [preference],
  );

  const a11yLabel = `Appearance, ${selected.label}`;
  const styles = createStyles(ds, theme);

  if (Platform.OS === 'ios') {
    return (
      <Host matchContents useViewportSizeMeasurement style={style}>
        <Picker
          label="Appearance"
          selection={preference}
          onSelectionChange={({nativeEvent}) => {
            const next = nativeEvent.selection;
            if (isThemePreference(next)) setScheme(next);
          }}
          modifiers={[pickerStyle('menu')]}
        >
          {SCHEMES.map((s) => (
            <Button
              key={s.id}
              label={s.label}
              modifiers={[{$type: 'tag', tag: s.id}]}
            />
          ))}
        </Picker>
      </Host>
    );
  }

  return (
    <SykaMenuView
      actions={actions}
      onPressAction={({nativeEvent}) => {
        const next = nativeEvent.event;
        if (isThemePreference(next)) setScheme(next);
      }}
      style={[style]}
      accessibilityLabel={a11yLabel}
      accessibilityHint="Opens appearance options"
    >
      <View style={styles.trigger}>
        <ThemedText variant="value">{selected.label}</ThemedText>
        <Icon name={AppIcons.ui.chevronUpDown} size="sm" colorToken="muted" />
      </View>
    </SykaMenuView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) => ({
    trigger: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: ds.spacing.xs,
    },
  }),
  (ds, theme) => themeKey(theme, ds),
);
