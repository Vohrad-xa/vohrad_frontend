import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {PersonalEmailForm} from '@/features/auth';

export default function PersonalEmailModal() {
  const handleSuccess = () => {};

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
