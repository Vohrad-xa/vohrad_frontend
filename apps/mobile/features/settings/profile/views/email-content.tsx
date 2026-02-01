import React, {forwardRef, useImperativeHandle} from 'react';
import {ScrollView} from 'react-native';
import {HelperText, List, TextInput} from 'react-native-paper';
import {Palette} from '@/constants';
import {useTheme} from '@/providers';
import {formatDate} from '@/utils';
import {useProfileEdit} from '../hooks';

export type EmailContentHandle = {
  save: () => Promise<void>;
};

export const EmailContent = forwardRef<EmailContentHandle>((_, ref) => {
  const {ds} = useTheme();

  const {email: emailEdit} = useProfileEdit();
  const {emailValue, setEmailValue, pendingEmail, pendingEmailExpiresAt, save} =
    emailEdit;

  useImperativeHandle(ref, () => ({save}), [save]);

  return (
    <ScrollView
      style={{flex: 1, gap: ds.spacing.md}}
      keyboardShouldPersistTaps="handled"
    >
      <List.Section title="Primary Email">
        <TextInput
          mode="outlined"
          label="Email"
          placeholder="Email address"
          value={emailValue}
          onChangeText={setEmailValue}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="done"
          right={<TextInput.Icon icon="email-outline" />}
        />
      </List.Section>

      {pendingEmail ? (
        <List.Section title="Pending Request">
          <TextInput
            mode="outlined"
            label="New email"
            value={pendingEmail}
            textColor={Palette.gray[500]}
            editable={false}
            right={
              <TextInput.Icon icon="clock-outline" color={Palette.orange} />
            }
          />
          <HelperText type="info" visible>
            You have requested to change your email.{'\n'}A verification link
            has been sent. Expires on{' '}
            {formatDate(pendingEmailExpiresAt, {includeTime: true})}.
          </HelperText>
        </List.Section>
      ) : null}
    </ScrollView>
  );
});

EmailContent.displayName = 'EmailContent';
