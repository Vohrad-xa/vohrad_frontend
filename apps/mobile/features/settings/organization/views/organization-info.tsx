import {useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {useTheme} from '@/providers';
import {useBusinessDetails} from '../use-business-details';

export function OrganizationInfoView() {
  const {ds} = useTheme();
  const {
    name,
    email,
    phone,
    website,
    street,
    streetNumber,
    city,
    province,
    postalCode,
    country,
  } = useBusinessDetails();

  const initialValues = useMemo(
    () => ({
      name,
      email,
      phone,
      website,
      street,
      streetNumber,
      city,
      province,
      postalCode,
      country,
    }),
    [
      name,
      email,
      phone,
      website,
      street,
      streetNumber,
      city,
      province,
      postalCode,
      country,
    ],
  );

  const [values, setValues] = useState(initialValues);

  const handleChange = (key: keyof typeof values) => (value: string) => {
    setValues((prev) => ({...prev, [key]: value}));
  };

  return (
    <ScrollView style={{flex: 1}} keyboardShouldPersistTaps="handled">
      <View style={{gap: ds.spacing.lg, padding: ds.spacing.lg}}>
        <TextInput
          mode="outlined"
          label="Name"
          value={values.name}
          onChangeText={handleChange('name')}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Email"
          value={values.email}
          onChangeText={handleChange('email')}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="done"
          left={<TextInput.Icon icon="email-outline" />}
        />

        <TextInput
          mode="outlined"
          label="Phone"
          value={values.phone}
          onChangeText={handleChange('phone')}
          keyboardType="phone-pad"
          returnKeyType="done"
          left={<TextInput.Icon icon="phone-outline" />}
        />

        <TextInput
          mode="outlined"
          label="Website"
          value={values.website}
          onChangeText={handleChange('website')}
          autoCapitalize="none"
          keyboardType="url"
          returnKeyType="done"
          left={<TextInput.Icon icon="web" />}
        />

        <TextInput
          mode="outlined"
          label="Street"
          value={values.street}
          onChangeText={handleChange('street')}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Street Number"
          value={values.streetNumber}
          onChangeText={handleChange('streetNumber')}
          autoCapitalize="characters"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="City"
          value={values.city}
          onChangeText={handleChange('city')}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Province"
          value={values.province}
          onChangeText={handleChange('province')}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Postal Code"
          value={values.postalCode}
          onChangeText={handleChange('postalCode')}
          autoCapitalize="characters"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Country"
          value={values.country}
          onChangeText={handleChange('country')}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>
    </ScrollView>
  );
}
