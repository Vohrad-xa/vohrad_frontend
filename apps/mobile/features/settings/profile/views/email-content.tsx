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
  type TextFieldRef,
  LabeledContent,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {AppIcons, Icon, formatDate, type IconName} from '@/utils';
import {useProfile} from '../hooks';

export type EmailContentHandle = {
  save: () => Promise<void>;
};

export const EmailContent = forwardRef<EmailContentHandle>((_, ref) => {
  const {email, pendingEmail, pendingEmailExpiresAt, updateEmail} =
    useProfile();

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
          <VStack alignment="leading" spacing={ds.spacing.xl}>
            <Icon
              useSwiftUI
              name={'envelope' as IconName}
              size="xxl"
              color={Palette.blue}
            />

            <Text
              baselineOffset={ds.spacing.xs}
              modifiers={[
                font({
                  size: ds.typography.ios.body.baseSize,
                  family: 'system',
                  design: 'rounded',
                }),
                foregroundStyle('secondary'),
              ]}
            >
              This Email will be used to support account security, including,
              login, identity verification and account recovery.
            </Text>
          </VStack>
        </Section>

        <Section title="Email Address">
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

        {pendingEmail && (
          <Section
            title="New Email"
            footer={
              <Text>
                A verification link has been sent to {pendingEmail}
                {'\n'}The link will expire on{' '}
                {formatDate(pendingEmailExpiresAt, {includeTime: true})}.{'\n'}
                In case you did not receive a link, you can request a new one.
              </Text>
            }
          >
            <LabeledContent label={pendingEmail}>
              <HStack spacing={ds.spacing.sm}>
                <Text
                  modifiers={[
                    font({
                      size: ds.typography.ios.footnote.baseSize,
                      family: 'system',
                    }),
                    foregroundStyle('orange'),
                  ]}
                >
                  Pending
                </Text>
                <Icon
                  useSwiftUI
                  name={AppIcons.status.pending}
                  color={Palette.orange}
                  size="xs"
                />
              </HStack>
            </LabeledContent>
          </Section>
        )}
      </Form>
    </Host>
  );
});

EmailContent.displayName = 'EmailContent';
