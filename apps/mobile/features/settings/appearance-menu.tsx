import {type ViewStyle} from 'react-native';
import {Host, Picker} from '@expo/ui/swift-ui';
import {useTheme} from '@/providers';

type AppearanceMenuProps = {
  style?: ViewStyle;
};
export function AppearanceMenu({style}: AppearanceMenuProps) {
  const {preference, setScheme, theme} = useTheme();
  const options = ['Light', 'Dark', 'System'];
  const values: Array<'light' | 'dark' | 'system'> = [
    'light',
    'dark',
    'system',
  ];
  const selectedIndex = values.indexOf(preference);
  return (
    <Host matchContents useViewportSizeMeasurement style={style}>
      <Picker
        options={options}
        selectedIndex={selectedIndex}
        variant="menu"
        label="Appearance"
        color={theme.muted}
        onOptionSelected={({nativeEvent}) =>
          setScheme(values[nativeEvent.index])
        }
      />
    </Host>
  );
}
