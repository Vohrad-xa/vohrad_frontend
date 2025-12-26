import React from 'react';
import {Platform, Pressable, type ViewStyle} from 'react-native';

import {ThemedText} from '@/components/ui';
import {PaperMenu} from '@/components/ui/paper-menu';
import {useTheme} from '@/providers';

type AppearanceMenuProps = {
  style?: ViewStyle;
};

export function AppearanceMenu({style}: AppearanceMenuProps) {
  const {preference, setScheme} = useTheme();
  const values: Array<'light' | 'dark' | 'system'> = [
    'light',
    'dark',
    'system',
  ];
  const options = ['Light', 'Dark', 'System'];
  const selectedIndex = values.indexOf(preference);

  if (Platform.OS === 'ios') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {Host, Picker} = require('sykamore-ui/ios');

    return (
      <Host matchContents useViewportSizeMeasurement style={style}>
        <Picker
          options={options}
          selectedIndex={selectedIndex}
          variant="menu"
          label="Appearance"
          onOptionSelected={({nativeEvent}: {nativeEvent: {index: number}}) =>
            setScheme(values[nativeEvent.index])
          }
        />
      </Host>
    );
  }

  if (Platform.OS === 'android') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {Picker} = require('sykamore-ui/android');

    return (
      <Picker
        key={preference}
        options={options}
        selectedIndex={selectedIndex}
        variant="menu"
        triggerContentPadding={{start: 4, end: 0}}
        onOptionSelected={({nativeEvent}: {nativeEvent: {index: number}}) =>
          setScheme(values[nativeEvent.index])
        }
        style={style}
      />
    );
  }

  // Fallback for web or other platforms
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
        <ThemedText variant="label">{options[selectedIndex]}</ThemedText>
      </Pressable>
    </PaperMenu>
  );
}
