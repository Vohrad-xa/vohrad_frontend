import React, {forwardRef, useImperativeHandle} from 'react';
import {View} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import {useTheme} from '@/providers';
import {useProfileEdit} from '../hooks';

export type PhoneContentHandle = {
  save: () => Promise<void>;
};

const SUPPORTING_TEXT =
  'This phone number will be used to support account security, including identity verification and account recovery. The number can be updated or removed at any time.';

export const PhoneContent = forwardRef<PhoneContentHandle>((_, ref) => {
  const {ds} = useTheme();

  const {phone} = useProfileEdit();
  const {phoneValue, setPhoneValue, save} = phone;

  useImperativeHandle(ref, () => ({save}), [save]);

  return (
    <View style={{flex: 1, gap: ds.spacing.md}}>
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
    </View>
  );
});

PhoneContent.displayName = 'PhoneContent';
