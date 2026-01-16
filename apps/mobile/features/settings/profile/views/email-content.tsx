import {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  useRef,
} from 'react';
import {Palette} from '@/constants';
import {
  Host,
  Form,
  Section,
  HStack,
  Spacer,
  Text,
  Button,
  TextField,
  accessibilityLabel,
  font,
  foregroundStyle,
  disabled,
  VStack,
  Image,
  type TextFieldRef,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {AppIcons, Icon} from '@/utils';
import {useProfile} from '../hooks';

export type EmailContentHandle = {
  save: () => Promise<void>;
};

export const EmailContent = forwardRef<EmailContentHandle>((_, ref) => {
  const {email, pendingEmail, updateEmail} = useProfile();
  const isEmailVerified = !pendingEmail;
  const {ds} = useTheme();
  const textFieldRef = useRef<TextFieldRef>(null);

  const [emailValue, setEmailValue] = useState(email);
  const [isEditing, setIsEditing] = useState(false);

  const save = useCallback(async () => {
    if (isEditing && emailValue !== email) {
      await updateEmail(emailValue);
    }
  }, [isEditing, emailValue, email, updateEmail]);

  useImperativeHandle(ref, () => ({save}), [save]);

  const handleEditPress = useCallback(() => {
    setIsEditing(true);
    // Small delay to ensure state updates before focus
    setTimeout(() => {
      textFieldRef.current?.focus();
    }, 100);
  }, []);

  const handleCancelPress = useCallback(() => {
    setIsEditing(false);
    setEmailValue(email);
    textFieldRef.current?.setText(email);
    textFieldRef.current?.blur();
  }, [email]);

  return (
    <Host style={{flex: 1}}>
      <Form>
        <Section>
          <VStack alignment="leading" spacing={ds.spacing.lg}>
            <Image
              systemName="envelope.badge.person.crop"
              size={ds.iconSize.xxxl}
              color={Palette.blue}
            />
            <HStack spacing={ds.spacing.lg}>
              <Text
                modifiers={[
                  font({
                    size: ds.typography.ios.title2.baseSize,
                    weight: 'semibold',
                    design: 'default',
                  }),
                ]}
              >
                Email Address
              </Text>
              <HStack spacing={ds.spacing.xs}>
                <Icon
                  useSwiftUI
                  name={
                    isEmailVerified
                      ? AppIcons.status.success
                      : AppIcons.status.pending
                  }
                  color={isEmailVerified ? Palette.green : Palette.orange}
                  size="xs"
                />
                <Text
                  italic
                  modifiers={[
                    font({
                      size: ds.typography.ios.caption.baseSize,
                      weight: 'medium',
                    }),
                    foregroundStyle(isEmailVerified ? 'green' : 'orange'),
                  ]}
                >
                  {isEmailVerified ? 'Verified' : 'Verification Pending'}
                </Text>
              </HStack>
            </HStack>
            <Text
              baselineOffset={ds.spacing.xs}
              modifiers={[
                font({
                  size: ds.typography.ios.callout.baseSize,
                  design: 'rounded',
                }),
                foregroundStyle('secondary'),
              ]}
            >
              Your Email is used for account login, account recovery, and
              important notifications.
              {'\n'}You can change your email address at any time by tapping the
              edit button.
            </Text>
          </VStack>
        </Section>

        <Section>
          <HStack>
            <TextField
              ref={textFieldRef}
              defaultValue={email}
              placeholder="Email address"
              textContentType="email-address"
              keyboardType="email-address"
              onChangeText={setEmailValue}
              modifiers={[
                disabled(!isEditing),
                accessibilityLabel('Email address'),
              ]}
            />
            <Spacer />
            <Button
              label={isEditing ? 'Cancel' : 'Edit'}
              role={isEditing ? 'destructive' : 'default'}
              onPress={isEditing ? handleCancelPress : handleEditPress}
              modifiers={[
                accessibilityLabel(isEditing ? 'Cancel editing' : 'Edit email'),
              ]}
            />
          </HStack>
        </Section>
      </Form>
    </Host>
  );
});

EmailContent.displayName = 'EmailContent';
