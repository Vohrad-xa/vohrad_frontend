import React, {useState, useCallback} from 'react';
import {
  Host,
  List,
  Section,
  Button,
  Picker,
  pickerStyle,
  tint,
} from '@/modules/sykamore-ui';

const LANGUAGES = [
  {code: 'en', label: 'English'},
  {code: 'nl', label: 'Dutch'},
  {code: 'fr', label: 'French'},
] as const;

type LanguageCode = (typeof LANGUAGES)[number]['code'];

export function LanguageContent() {
  const [selected, setSelected] = useState<LanguageCode>('en');

  const onSelectionChange = useCallback(
    ({nativeEvent}: {nativeEvent: {selection: string | number}}) => {
      setSelected(nativeEvent.selection as LanguageCode);
    },
    [],
  );

  return (
    <Host style={{flex: 1}}>
      <List listStyle="insetGrouped">
        <Section title="Interface Language">
          <Picker
            selection={selected}
            onSelectionChange={onSelectionChange}
            modifiers={[pickerStyle('inline'), tint('primary')]}
          >
            {LANGUAGES.map(({code, label}) => (
              <Button
                key={code}
                label={label}
                modifiers={[{$type: 'tag', tag: code}]}
              />
            ))}
          </Picker>
        </Section>
      </List>
    </Host>
  );
}
