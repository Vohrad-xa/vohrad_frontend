import {useState, forwardRef, useImperativeHandle, useCallback} from 'react';
import {Platform, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {
  Host,
  Form,
  TextField,
  LabeledContent,
  accessibilityLabel,
  frame,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {useProfile} from '../hooks';

export type NameContentHandle = {
  save: () => Promise<void>;
};

export const NameContent = forwardRef<NameContentHandle>((_, ref) => {
  const {ds} = useTheme();
  const {firstName, lastName, updateName} = useProfile();

  const [firstNameValue, setFirstNameValue] = useState(firstName);
  const [lastNameValue, setLastNameValue] = useState(lastName);

  const save = useCallback(async () => {
    await updateName(firstNameValue, lastNameValue);
  }, [firstNameValue, lastNameValue, updateName]);

  useImperativeHandle(ref, () => ({save}), [save]);

  if (Platform.OS === 'android') {
    return (
      <View style={{gap: ds.spacing.lg, flex: 1}}>
        <TextInput
          value={firstNameValue}
          onChangeText={setFirstNameValue}
          label="First Name"
          placeholder="Enter First Name"
          autoCapitalize="words"
          keyboardType="default"
          numberOfLines={1}
          mode="outlined"
          autoFocus
        />
        <TextInput
          value={lastNameValue}
          onChangeText={setLastNameValue}
          label="Last Name"
          placeholder="Enter Last Name"
          autoCapitalize="words"
          keyboardType="default"
          numberOfLines={1}
          mode="outlined"
        />
      </View>
    );
  }

  return (
    <Host style={{flex: 1}}>
      <Form>
        <LabeledContent label="First">
          <TextField
            placeholder="First"
            defaultValue={firstName}
            textContentType="given-name"
            keyboardType="default"
            submitLabel="done"
            autocapitalization="words"
            onChangeText={setFirstNameValue}
            numberOfLines={1}
            autoFocus
            modifiers={[
              accessibilityLabel('First name input field'),
              frame({maxWidth: ds.screen.width / 1.8}),
            ]}
          />
        </LabeledContent>

        <LabeledContent label="Last">
          <TextField
            placeholder="Last"
            defaultValue={lastName}
            textContentType="family-name"
            keyboardType="default"
            submitLabel="done"
            autocapitalization="words"
            onChangeText={setLastNameValue}
            numberOfLines={1}
            modifiers={[
              accessibilityLabel('Last name input field'),
              frame({maxWidth: ds.screen.width / 1.8}),
            ]}
          />
        </LabeledContent>
      </Form>
    </Host>
  );
});

NameContent.displayName = 'NameContent';
