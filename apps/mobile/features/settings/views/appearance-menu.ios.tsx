import {type StyleProp, type ViewStyle, View} from 'react-native';
import type {ThemePreference} from '@/constants';
import {useTheme} from '@/providers';
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
  style?: StyleProp<ViewStyle>;
};

export function AppearanceMenu({style}: AppearanceMenuProps) {
  const {preference, setScheme} = useTheme();

  return (
    <View style={style}>
      <Host matchContents useViewportSizeMeasurement>
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
    </View>
  );
}
