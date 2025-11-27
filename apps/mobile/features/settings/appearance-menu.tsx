import {Platform, type ViewStyle, Pressable} from 'react-native';
import {ThemedText} from '@/components/ui';
import {PaperMenu} from '@/components/ui/paper-menu';
import {useTheme} from '@/providers';

type AppearanceMenuProps = {
  style?: ViewStyle;
};

export function AppearanceMenu({style}: AppearanceMenuProps) {
  const {preference, setScheme, theme} = useTheme();
  const values: Array<'light' | 'dark' | 'system'> = [
    'light',
    'dark',
    'system',
  ];
  const options = ['Light', 'Dark', 'System'];

  if (Platform.OS === 'ios') {
    const {Host, Picker} = require('@expo/ui/swift-ui');
    const selectedIndex = values.indexOf(preference);

    return (
      <Host matchContents useViewportSizeMeasurement style={style}>
        <Picker
          options={options}
          selectedIndex={selectedIndex}
          variant="menu"
          label="Appearance"
          color={theme.muted}
          onOptionSelected={({nativeEvent}: {nativeEvent: {index: number}}) =>
            setScheme(values[nativeEvent.index])
          }
        />
      </Host>
    );
  }

  const actions = values.map((value, index) => ({
    id: value,
    title: options[index],
    state: preference === value ? ('on' as const) : undefined,
  }));

  return (
    <PaperMenu
      actions={actions}
      onSelect={(id) => setScheme(id as (typeof values)[number])}
    >
      <Pressable style={style}>
        <ThemedText variant="label">
          {options[values.indexOf(preference)]}
        </ThemedText>
      </Pressable>
    </PaperMenu>
  );
}
