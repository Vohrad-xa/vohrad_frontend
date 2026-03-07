import React, {forwardRef, useImperativeHandle} from 'react';
import {ScrollView} from 'react-native';
import {Button, List} from 'react-native-paper';
import {useTheme} from '@/providers';
import {useProfileEdit} from '../hooks';

export type EmailContentHandle = {
  save: () => Promise<void>;
};

export const EmailContent = forwardRef<EmailContentHandle>((_, ref) => {
  const {ds} = useTheme();

  const {email: emailEdit} = useProfileEdit();
  const {email, requestChange, save} = emailEdit;

  useImperativeHandle(ref, () => ({save}), [save]);

  return (
    <ScrollView
      style={{flex: 1, gap: ds.spacing.md}}
      keyboardShouldPersistTaps="handled"
    >
      <List.Section title="Primary Email">
        <List.Item
          title={email}
          left={(props) => <List.Icon {...props} icon="email-outline" />}
          right={() => (
            <Button mode="text" onPress={() => void requestChange()}>
              Edit
            </Button>
          )}
        />
      </List.Section>
    </ScrollView>
  );
});

EmailContent.displayName = 'EmailContent';
