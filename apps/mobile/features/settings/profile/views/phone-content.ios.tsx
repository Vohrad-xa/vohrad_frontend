import React, {forwardRef, useImperativeHandle} from 'react';
import {useTheme} from '@/providers';
import {Icon, type IconName} from '@/utils';
import {
  Host,
  Form,
  Section,
  VStack,
  Text,
  Button,
  TextField,
  LabeledContent,
  accessibilityLabel,
  font,
  foregroundStyle,
  frame,
  buttonStyle,
} from 'sykamore-ui/ios';
import {useProfileEdit} from '../hooks';

export type PhoneContentHandle = {
  save: () => Promise<void>;
};

const SUPPORTING_TEXT =
  'This phone number will be used to support account security, including identity verification and account recovery. The number can be updated or removed at any time.';

export const PhoneContent = forwardRef<PhoneContentHandle>((_, ref) => {
  const {ds} = useTheme();

  const {phone} = useProfileEdit();
  const {phoneNumber, isEditing, startEditing, setPhoneValue, save} = phone;

  useImperativeHandle(ref, () => ({save}), [save]);

  return (
    <Host style={{flex: 1}}>
      <Form>
        <Section>
          <VStack alignment="leading" spacing={ds.spacing.lg}>
            <Icon
              useSwiftUI
              name={'phone.badge.checkmark' as IconName}
              colorToken="tint"
              size="xxxl"
            />
            <Text
              modifiers={[
                font({
                  size: ds.typography.ios.title2.baseSize,
                  weight: 'semibold',
                }),
              ]}
            >
              {phoneNumber || 'No phone number'}
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

          {!isEditing && (
            <Button
              label="Edit phone number"
              onPress={startEditing}
              modifiers={[
                buttonStyle('automatic'),
                accessibilityLabel('Edit phone number button'),
              ]}
            />
          )}
        </Section>

        {isEditing && (
          <Section title="Edit number" collapsible>
            <LabeledContent label="Phone">
              <TextField
                placeholder="Phone Number"
                defaultValue={phoneNumber}
                textContentType="telephone-number"
                keyboardType="phone-pad"
                submitLabel="done"
                onChangeText={setPhoneValue}
                numberOfLines={1}
                autoFocus
                modifiers={[
                  accessibilityLabel('Phone number input field'),
                  frame({maxWidth: ds.screen.width / 2}),
                ]}
              />
            </LabeledContent>
          </Section>
        )}
      </Form>
    </Host>
  );
});

PhoneContent.displayName = 'PhoneContent';
