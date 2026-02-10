import React from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {PersonalEmailForm} from '@/features/auth';
import {useTheme} from '@/providers';

export default function PersonalEmailModal() {
  const handleSuccess = () => {};
  const {ds, theme} = useTheme();

  return (
    <KeyboardAwareScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{flex: 1}}
    >
      <PersonalEmailForm onSuccess={handleSuccess} />
    </KeyboardAwareScrollView>
  );
}
