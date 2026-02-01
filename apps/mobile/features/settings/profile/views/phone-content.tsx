import React, {forwardRef, useImperativeHandle} from 'react';
import {HelperText, TextInput, List} from 'react-native-paper';
import {useProfileEdit} from '../hooks';

export type PhoneContentHandle = {
  save: () => Promise<void>;
};

const SUPPORTING_TEXT =
  'This phone number will be used to support account security, including identity verification and account recovery. The number can be updated or removed at any time.';

export const PhoneContent = forwardRef<PhoneContentHandle>((_, ref) => {
  const {phone} = useProfileEdit();
  const {phoneValue, setPhoneValue, save} = phone;

  useImperativeHandle(ref, () => ({save}), [save]);

  return (
    <List.Section>
      <TextInput
        mode="outlined"
        label="Phone"
        placeholder="Phone number"
        value={phoneValue}
        onChangeText={setPhoneValue}
        keyboardType="phone-pad"
        autoComplete="tel"
        returnKeyType="done"
        autoFocus
        left={<TextInput.Icon icon="phone" />}
      />
      <HelperText type="info" visible>
        {SUPPORTING_TEXT}
      </HelperText>
    </List.Section>
  );
});

PhoneContent.displayName = 'PhoneContent';
