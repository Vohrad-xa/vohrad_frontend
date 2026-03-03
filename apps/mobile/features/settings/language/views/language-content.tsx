import {useState, useCallback} from 'react';
import {ScrollView} from 'react-native';
import {List, RadioButton} from 'react-native-paper';

const LANGUAGES = [
  {code: 'en', label: 'English'},
  {code: 'nl', label: 'Dutch'},
  {code: 'fr', label: 'French'},
] as const;

type LanguageCode = (typeof LANGUAGES)[number]['code'];

export function LanguageContent() {
  const [selected, setSelected] = useState<LanguageCode>('en');

  const onValueChange = useCallback((value: string) => {
    setSelected(value as LanguageCode);
  }, []);

  return (
    <ScrollView style={{flex: 1}}>
      <List.Section title="Interface Language">
        <RadioButton.Group value={selected} onValueChange={onValueChange}>
          {LANGUAGES.map(({code, label}) => (
            <RadioButton.Item key={code} value={code} label={label} />
          ))}
        </RadioButton.Group>
      </List.Section>
    </ScrollView>
  );
}
