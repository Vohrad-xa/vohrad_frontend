import {useState, forwardRef, useImperativeHandle, useCallback} from 'react';
import {
  Host,
  Form,
  TextField,
  LabeledContent,
  accessibilityLabel,
  frame,
  Section,
  Text,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {useProfile} from '../hooks';

export type AddressContentHandle = {
  save: () => Promise<void>;
};

export const AddressContent = forwardRef<AddressContentHandle>((_, ref) => {
  const {address, city, province, postalCode, country, updateAddress} =
    useProfile();
  const {ds} = useTheme();
  const [addressValue, setAddressValue] = useState(address);
  const [cityValue, setCityValue] = useState(city);
  const [provinceValue, setProvinceValue] = useState(province);
  const [postalCodeValue, setPostalCodeValue] = useState(postalCode);
  const [countryValue, setCountryValue] = useState(country);

  const save = useCallback(async () => {
    await updateAddress({
      address: addressValue,
      city: cityValue,
      province: provinceValue,
      postal_code: postalCodeValue,
      country: countryValue,
    });
  }, [
    addressValue,
    cityValue,
    provinceValue,
    postalCodeValue,
    countryValue,
    updateAddress,
  ]);

  useImperativeHandle(ref, () => ({save}), [save]);

  return (
    <Host style={{flex: 1}}>
      <Form>
        <Section
          footer={
            <Text>
              Address can be changed here, it will not be visible to other users
              within your organization except for the ones with admin or manager
              permissions.
            </Text>
          }
        >
          <LabeledContent label="Street">
            <TextField
              placeholder="Street"
              defaultValue={address}
              textContentType="street-address-line1"
              keyboardType="default"
              submitLabel="done"
              autocapitalization="words"
              onChangeText={setAddressValue}
              numberOfLines={1}
              modifiers={[
                accessibilityLabel('Street input field'),
                frame({maxWidth: ds.screen.width / 1.8}),
              ]}
            />
          </LabeledContent>

          <LabeledContent label="City">
            <TextField
              placeholder="City"
              defaultValue={city}
              textContentType="address-city"
              keyboardType="default"
              submitLabel="done"
              autocapitalization="words"
              onChangeText={setCityValue}
              numberOfLines={1}
              modifiers={[
                accessibilityLabel('City input field'),
                frame({maxWidth: ds.screen.width / 1.8}),
              ]}
            />
          </LabeledContent>

          <LabeledContent label="Province">
            <TextField
              placeholder="Province"
              defaultValue={province}
              textContentType="address-state"
              keyboardType="default"
              submitLabel="done"
              autocapitalization="words"
              onChangeText={setProvinceValue}
              numberOfLines={1}
              modifiers={[
                accessibilityLabel('Province input field'),
                frame({maxWidth: ds.screen.width / 1.8}),
              ]}
            />
          </LabeledContent>

          <LabeledContent label="Postal Code">
            <TextField
              placeholder="Postal Code"
              defaultValue={postalCode}
              textContentType="postal-code"
              keyboardType="default"
              submitLabel="done"
              autocapitalization="characters"
              onChangeText={setPostalCodeValue}
              numberOfLines={1}
              modifiers={[
                accessibilityLabel('Postal code input field'),
                frame({maxWidth: ds.screen.width / 1.8}),
              ]}
            />
          </LabeledContent>

          <LabeledContent label="Country">
            <TextField
              placeholder="Country"
              defaultValue={country}
              keyboardType="default"
              submitLabel="done"
              autocapitalization="words"
              onChangeText={setCountryValue}
              numberOfLines={1}
              modifiers={[
                accessibilityLabel('Country input field'),
                frame({maxWidth: ds.screen.width / 1.8}),
              ]}
            />
          </LabeledContent>
        </Section>
      </Form>
    </Host>
  );
});

AddressContent.displayName = 'AddressContent';
