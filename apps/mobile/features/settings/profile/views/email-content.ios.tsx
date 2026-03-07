import React, {forwardRef, useCallback, useImperativeHandle} from 'react';
import {useTheme} from '@/providers';
import {Icon, type IconName} from '@/utils';
import {
  Host,
  Form,
  Section,
  Text,
  Button,
  accessibilityLabel,
  font,
  foregroundStyle,
  VStack,
  buttonStyle,
  listRowBackground,
  frame,
  listSectionSpacing,
} from 'sykamore-ui/ios';
import {useProfileEdit} from '../hooks';

export type EmailContentHandle = {
  save: () => Promise<void>;
};

const SUPPORTING_TEXT =
  'This email will be used to support account security, including login, identity verification and account recovery.';

export const EmailContent = forwardRef<EmailContentHandle>((_, ref) => {
  const {ds} = useTheme();

  const {email: emailEdit} = useProfileEdit();
  const {email, requestChange, save} = emailEdit;

  useImperativeHandle(ref, () => ({save}), [save]);

  const handleEditPress = useCallback(() => {
    void requestChange();
  }, [requestChange]);

  return (
    <Host style={{flex: 1}}>
      <Form>
        <Section modifiers={[listSectionSpacing(ds.spacing.sm)]}>
          <VStack alignment="leading" spacing={ds.spacing.lg}>
            <Icon
              useSwiftUI
              name={'envelope' as IconName}
              size="xxxl"
              colorToken="tint"
            />
            <Text
              modifiers={[
                font({
                  textStyle: 'title2',
                  weight: 'semibold',
                }),
              ]}
            >
              Email Address
            </Text>

            <Text
              modifiers={[
                font({textStyle: 'body'}),
                foregroundStyle('secondary'),
              ]}
            >
              {SUPPORTING_TEXT}
            </Text>
          </VStack>
          <Text modifiers={[accessibilityLabel('Email address')]}>{email}</Text>
        </Section>

        <Section modifiers={[listRowBackground('transparent')]}>
          <Button
            label="Edit email"
            role="default"
            onPress={handleEditPress}
            modifiers={[
              accessibilityLabel('Edit email'),
              buttonStyle({
                style: 'glassProminent',
                borderShape: 'roundedRectangle',
              }),
              frame({maxWidth: Infinity}),
            ]}
          />
        </Section>
      </Form>
    </Host>
  );
});

EmailContent.displayName = 'EmailContent';
