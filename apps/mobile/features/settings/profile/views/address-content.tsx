import React, {forwardRef, useImperativeHandle} from 'react';
import {ScrollView, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {useTheme} from '@/providers';
import {useProfileEdit} from '../hooks';

export type AddressContentHandle = {
  save: () => Promise<void>;
};

export const AddressContent = forwardRef<AddressContentHandle>((_, ref) => {
  const {ds} = useTheme();

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
      <View style={{gap: ds.spacing.lg}}>
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
      </View>
    </ScrollView>
  );
});

AddressContent.displayName = 'AddressContent';
