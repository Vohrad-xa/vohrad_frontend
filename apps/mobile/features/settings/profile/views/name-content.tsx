import {useState, forwardRef, useImperativeHandle, useCallback} from 'react';
import {
  Host,
  Form,
  HStack,
  TextField,
  Label,
  accessibilityLabel,
} from '@/modules/sykamore-ui';
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

  return (
    <Host style={{flex: 1}}>
      <Form>
        <HStack spacing={80}>
          <Label title="First" />
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
            modifiers={[accessibilityLabel('First name input field')]}
          />
        </HStack>

        <HStack spacing={80}>
          <Label title="Last" />
          <TextField
            placeholder="Last"
            defaultValue={lastName}
            textContentType="family-name"
            keyboardType="default"
            submitLabel="done"
            autocapitalization="words"
            onChangeText={setLastNameValue}
            numberOfLines={1}
            modifiers={[accessibilityLabel('Last name input field')]}
          />
        </HStack>
      </Form>
    </Host>
  );
});

NameContent.displayName = 'NameContent';
