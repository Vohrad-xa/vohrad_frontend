import React, {forwardRef, useImperativeHandle} from 'react';
import {ScrollView} from 'react-native';
import {List, TextInput} from 'react-native-paper';
import {useProfileEdit} from '../hooks';

export type AddressContentHandle = {
  save: () => Promise<void>;
};

export const AddressContent = forwardRef<AddressContentHandle>((_, ref) => {
  const {address} = useProfileEdit();
  const {
    addressValue,
    cityValue,
    provinceValue,
    postalCodeValue,
    countryValue,
    setAddressValue,
    setCityValue,
    setProvinceValue,
    setPostalCodeValue,
    setCountryValue,
    save,
  } = address;

  useImperativeHandle(ref, () => ({save}), [save]);

  return (
    <ScrollView style={{flex: 1}} keyboardShouldPersistTaps="handled">
      <List.Section title="Edit address details" style={{gap: 16}}>
        <TextInput
          mode="outlined"
          label="Street"
          placeholder="Street"
          value={addressValue}
          onChangeText={setAddressValue}
          autoCapitalize="words"
          returnKeyType="done"
          autoFocus
        />

        <TextInput
          mode="outlined"
          label="City"
          placeholder="City"
          value={cityValue}
          onChangeText={setCityValue}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Province"
          placeholder="Province"
          value={provinceValue}
          onChangeText={setProvinceValue}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Postal Code"
          placeholder="Postal Code"
          value={postalCodeValue}
          onChangeText={setPostalCodeValue}
          autoCapitalize="characters"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Country"
          placeholder="Country"
          value={countryValue}
          onChangeText={setCountryValue}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </List.Section>
    </ScrollView>
  );
});

AddressContent.displayName = 'AddressContent';
