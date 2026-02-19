import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {SignInForm} from '@/features/auth';

export default function SignInScreen() {
  return (
    <KeyboardAwareScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{flex: 1}}
    >
      <SignInForm />
    </KeyboardAwareScrollView>
  );
}
