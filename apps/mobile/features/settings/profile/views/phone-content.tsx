import {useState, forwardRef, useImperativeHandle, useCallback} from 'react';
import {Palette} from '@/constants';
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
  tint,
  buttonStyle,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {AppIcons, Icon} from '@/utils';
import {useProfile} from '../hooks';

export type PhoneContentHandle = {
  save: () => Promise<void>;
};

export const PhoneContent = forwardRef<PhoneContentHandle>((_, ref) => {
  const {phoneNumber, updatePhoneNumber} = useProfile();
  const {theme, ds} = useTheme();

  const [phoneValue, setPhoneValue] = useState(phoneNumber);
  const [isEditing, setIsEditing] = useState(false);

  const save = useCallback(async () => {
    if (phoneValue !== phoneNumber) {
      await updatePhoneNumber(phoneValue);
    }
  }, [phoneValue, phoneNumber, updatePhoneNumber]);

  useImperativeHandle(ref, () => ({save}), [save]);

  const handleModifyPress = useCallback(() => {
    setIsEditing(true);
  }, []);

  return (
    <Host style={{flex: 1}}>
      <Form>
        <Section>
          <VStack alignment="leading" spacing={ds.spacing.md}>
            <Icon
              useSwiftUI
              name="phone.badge.waveform"
              size="xxxl"
              color={Palette.green}
            />
            <Text
              modifiers={[
                font({
                  size: ds.typography.ios.title2.baseSize,
                  weight: 'semibold',
                  design: 'default',
                }),
              ]}
            >
              {phoneNumber || 'No phone number'}
            </Text>
            <Text
              baselineOffset={ds.spacing.xs}
              modifiers={[
                font({
                  size: ds.typography.ios.body.baseSize,
                  design: 'rounded',
                }),
                foregroundStyle('secondary'),
              ]}
            >
              This phone number will be used to support account security,
              including identity verification and account recovery. It will not
              be used for marketing unless explicit consent is provided. The
              number can be updated or removed at any time.
            </Text>
          </VStack>

          {!isEditing && (
            <Button
              systemImage={AppIcons.actions.edit}
              label="Modify Phone Number"
              onPress={handleModifyPress}
              modifiers={[
                buttonStyle('automatic'),
                tint(theme.text),
                accessibilityLabel('Modify phone number button'),
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
