import {StyleSheet} from 'react-native';
import {Link} from 'expo-router';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {TextInput, Surface} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory, AppIcons} from '@/utils';
import type {TenantInfoValues} from '../hooks/use-tenant-info-form';

type TenantInfoViewProps = {
  values: TenantInfoValues;
  onFieldChange: (key: keyof TenantInfoValues, value: string) => void;
};

export function TenantInfoView({values, onFieldChange}: TenantInfoViewProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText variant="headline" style={styles.title}>
        Tenant Info
      </ThemedText>

      <Surface mode="flat" style={styles.inputsContainer}>
        <ThemedText variant="subheadline">
          Organization details can be viewed and edited below.{'\n'}Name and
          email are read-only for security reasons, to change them, please{' '}
          <Link href="/" asChild>
            <ThemedText variant="subheadline" colorToken="accentBlue">
              contact us
            </ThemedText>
          </Link>
          .
        </ThemedText>

        <TextInput
          mode="outlined"
          label="Name"
          value={values.name}
          onChangeText={(value) => onFieldChange('name', value)}
          editable={false}
          autoCapitalize="words"
          returnKeyType="done"
          right={<TextInput.Icon icon={AppIcons.ui.privacy} />}
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
          left={<TextInput.Icon icon={AppIcons.ui.email} />}
          right={<TextInput.Icon icon={AppIcons.ui.privacy} />}
        />

        <TextInput
          mode="outlined"
          label="Phone"
          value={values.phone}
          onChangeText={(value) => onFieldChange('phone', value)}
          keyboardType="phone-pad"
          returnKeyType="done"
          left={<TextInput.Icon icon={AppIcons.ui.phone} />}
        />

        <TextInput
          mode="outlined"
          label="Industry"
          value={values.industry}
          onChangeText={(value) => onFieldChange('industry', value)}
          autoCapitalize="words"
          returnKeyType="done"
          left={<TextInput.Icon icon={AppIcons.domain.organization} />}
        />

        <TextInput
          mode="outlined"
          label="Website"
          value={values.website}
          onChangeText={(value) => onFieldChange('website', value)}
          autoCapitalize="none"
          keyboardType="url"
          returnKeyType="done"
          left={<TextInput.Icon icon={AppIcons.ui.web} />}
        />

        <TextInput
          mode="outlined"
          label="Tax ID"
          value={values.taxId}
          onChangeText={(value) => onFieldChange('taxId', value)}
          autoCapitalize="characters"
          returnKeyType="done"
          left={<TextInput.Icon icon={AppIcons.ui.tax} />}
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
      </Surface>
    </KeyboardAwareScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      inputsContainer: {
        padding: ds.spacing.xl,
        gap: ds.spacing.lg,
        backgroundColor: theme.card,
        borderTopLeftRadius: ds.borderRadius.xxl * 2,
        borderTopRightRadius: ds.borderRadius.xxl * 2,
      },
      title: {
        marginVertical: ds.spacing.xl,
        paddingHorizontal: ds.spacing.xl,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
