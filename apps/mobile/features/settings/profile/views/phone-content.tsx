import {useState, forwardRef, useImperativeHandle, useCallback} from 'react';
import {Platform, View} from 'react-native';
import {TextInput, HelperText} from 'react-native-paper';
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
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {Icon, type IconName} from '@/utils';
import {useProfile} from '../hooks';

export type PhoneContentHandle = {
  save: () => Promise<void>;
};

const SUPPORTING_TEXT =
  'This phone number will be used to support account security, including identity verification and account recovery. The number can be updated or removed at any time.';

export const PhoneContent = forwardRef<PhoneContentHandle>((_, ref) => {
  const {phoneNumber, updatePhoneNumber} = useProfile();
  const {ds} = useTheme();

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

  // iOS: keep your existing UX
  if (Platform.OS === 'ios') {
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
                onPress={handleModifyPress}
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
  }

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
