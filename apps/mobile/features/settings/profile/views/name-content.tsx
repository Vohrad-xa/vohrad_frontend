import React, {forwardRef, useImperativeHandle} from 'react';
import {ScrollView} from 'react-native';
import {TextInput, List} from 'react-native-paper';
import {useProfileEdit} from '../hooks';

export type NameContentHandle = {
  save: () => Promise<void>;
};

export const NameContent = forwardRef<NameContentHandle>((_, ref) => {
  const {name} = useProfileEdit();
  const {
    firstNameValue,
    lastNameValue,
    setFirstNameValue,
    setLastNameValue,
    save,
  } = name;

  useImperativeHandle(ref, () => ({save}), [save]);

  return (
    <ScrollView style={{flex: 1}} keyboardShouldPersistTaps="handled">
      <List.Section style={{gap: 16}}>
        <TextInput
          value={firstNameValue}
          onChangeText={setFirstNameValue}
          label="First Name"
          placeholder="Enter First Name"
          autoCapitalize="words"
          keyboardType="default"
          numberOfLines={1}
          mode="outlined"
          autoFocus
        />
        <TextInput
          value={lastNameValue}
          onChangeText={setLastNameValue}
          label="Last Name"
          placeholder="Enter Last Name"
          autoCapitalize="words"
          keyboardType="default"
          numberOfLines={1}
          mode="outlined"
        />
      </List.Section>
    </ScrollView>
  );
});

NameContent.displayName = 'NameContent';
