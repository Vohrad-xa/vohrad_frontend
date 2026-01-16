import {useState, forwardRef, useImperativeHandle, useCallback} from 'react';
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
  const {firstName, lastName, updateName} = useProfile();

  const [firstNameValue, setFirstNameValue] = useState(firstName);

  const [lastNameValue, setLastNameValue] = useState(lastName);

  const save = useCallback(async () => {
    await updateName(firstNameValue, lastNameValue);
  }, [firstNameValue, lastNameValue, updateName]);

  useImperativeHandle(ref, () => ({save}), [save]);

  const {ds} = useTheme();

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
              frame({maxWidth: ds.screen.width / 2}),
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
              frame({maxWidth: ds.screen.width / 2}),
            ]}
          />
        </LabeledContent>
      </Form>
    </Host>
  );
});

NameContent.displayName = 'NameContent';
