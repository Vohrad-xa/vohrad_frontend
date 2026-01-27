import {ScrollView, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {useTheme} from '@/providers';
export type OrganizationInfoValues = {
  name: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  streetNumber: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

type OrganizationInfoViewProps = {
  values: OrganizationInfoValues;
  onFieldChange: (key: keyof OrganizationInfoValues, value: string) => void;
};

export function OrganizationInfoView({
  values,
  onFieldChange,
}: OrganizationInfoViewProps) {
  const {ds} = useTheme();

  return (
    <ScrollView style={{flex: 1}} keyboardShouldPersistTaps="handled">
      <View style={{gap: ds.spacing.lg, padding: ds.spacing.lg}}>
        <TextInput
          mode="outlined"
          label="Name"
          value={values.name}
          onChangeText={(value) => onFieldChange('name', value)}
          editable={false}
          autoCapitalize="words"
          returnKeyType="done"
          right={<TextInput.Icon icon="lock-outline" />}
        />

        <TextInput
          mode="outlined"
          label="Email"
          value={values.email}
          onChangeText={(value) => onFieldChange('email', value)}
          editable={false}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="done"
          left={<TextInput.Icon icon="email-outline" />}
          right={<TextInput.Icon icon="lock-outline" />}
        />

        <TextInput
          mode="outlined"
          label="Phone"
          value={values.phone}
          onChangeText={(value) => onFieldChange('phone', value)}
          keyboardType="phone-pad"
          returnKeyType="done"
          left={<TextInput.Icon icon="phone-outline" />}
        />

        <TextInput
          mode="outlined"
          label="Website"
          value={values.website}
          onChangeText={(value) => onFieldChange('website', value)}
          autoCapitalize="none"
          keyboardType="url"
          returnKeyType="done"
          left={<TextInput.Icon icon="web" />}
        />

        <TextInput
          mode="outlined"
          label="Street"
          value={values.street}
          onChangeText={(value) => onFieldChange('street', value)}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Street Number"
          value={values.streetNumber}
          onChangeText={(value) => onFieldChange('streetNumber', value)}
          autoCapitalize="characters"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="City"
          value={values.city}
          onChangeText={(value) => onFieldChange('city', value)}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Province"
          value={values.province}
          onChangeText={(value) => onFieldChange('province', value)}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Postal Code"
          value={values.postalCode}
          onChangeText={(value) => onFieldChange('postalCode', value)}
          autoCapitalize="characters"
          returnKeyType="done"
        />

        <TextInput
          mode="outlined"
          label="Country"
          value={values.country}
          onChangeText={(value) => onFieldChange('country', value)}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>
    </ScrollView>
  );
}
