import React, {forwardRef, useImperativeHandle} from 'react';
import {useTheme} from '@/providers';
import {
  Host,
  Form,
  TextField,
  LabeledContent,
  accessibilityLabel,
  frame,
} from 'sykamore-ui/ios';
import {useProfileEdit} from '../hooks';

export type NameContentHandle = {
  save: () => Promise<void>;
};

export const NameContent = forwardRef<NameContentHandle>((_, ref) => {
  const {ds} = useTheme();

  const {name} = useProfileEdit();
  const {firstName, lastName, setFirstNameValue, setLastNameValue, save} = name;

  useImperativeHandle(ref, () => ({save}), [save]);

  return (
    <Host style={{flex: 1}}>
      <Form>
        <LabeledContent label="First">
          <TextField
            placeholder="First"
            defaultValue={firstName}
            textContentType="given-name"
            keyboardType="default"
            submitLabel="done"
            autocapitalization="words"
            onChangeText={setFirstNameValue}
            numberOfLines={1}
            autoFocus
            modifiers={[
              accessibilityLabel('First name input field'),
              frame({maxWidth: ds.screen.width / 1.8}),
            ]}
          />
        </LabeledContent>

        <LabeledContent label="Last">
          <TextField
            placeholder="Last"
            defaultValue={lastName}
            textContentType="family-name"
            keyboardType="default"
            submitLabel="done"
            autocapitalization="words"
            onChangeText={setLastNameValue}
            numberOfLines={1}
            modifiers={[
              accessibilityLabel('Last name input field'),
              frame({maxWidth: ds.screen.width / 1.8}),
            ]}
          />
        </LabeledContent>
      </Form>
    </Host>
  );
});

NameContent.displayName = 'NameContent';
