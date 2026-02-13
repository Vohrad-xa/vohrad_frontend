import {useTheme} from '@/providers';
import {
  Host,
  Form,
  Text,
  Label,
  Section,
  TextField,
  LabeledContent,
  listSectionSpacing,
  accessibilityLabel,
  frame,
} from 'sykamore-ui/ios';
import type {TenantInfoValues} from '../hooks/use-tenant-info-form';

type TenantInfoViewProps = {
  values: TenantInfoValues;
  onFieldChange: (key: keyof TenantInfoValues, value: string) => void;
};

export function TenantInfoView({values, onFieldChange}: TenantInfoViewProps) {
  const {ds} = useTheme();

  const fieldWidth = frame({maxWidth: ds.screen.width / 1.8});

  return (
    <Host style={{flex: 1}}>
      <Form>
        <Section modifiers={[listSectionSpacing('compact')]}>
          <LabeledContent
            label={<Label title="Name" systemImage="building.2" />}
          >
            <Text>{values.name}</Text>
          </LabeledContent>

          <LabeledContent
            label={<Label title="Email" systemImage="envelope" />}
          >
            <Text>{values.email}</Text>
          </LabeledContent>
        </Section>

        <Section
          footer={
            <Text markdown>
              Name and email are read-only for security reasons. To request
              changes, please [contact support](mobile://settings/support).
            </Text>
          }
        >
          <LabeledContent label="Phone">
            <TextField
              placeholder="Phone"
              defaultValue={values.phone}
              textContentType="telephone-number"
              keyboardType="phone-pad"
              submitLabel="done"
              onChangeText={(value) => onFieldChange('phone', value)}
              numberOfLines={1}
              modifiers={[accessibilityLabel('Phone number'), fieldWidth]}
            />
          </LabeledContent>

          <LabeledContent label="Website">
            <TextField
              placeholder="Website"
              defaultValue={values.website}
              keyboardType="url"
              submitLabel="done"
              autocapitalization="never"
              onChangeText={(value) => onFieldChange('website', value)}
              numberOfLines={1}
              modifiers={[accessibilityLabel('Website URL'), fieldWidth]}
            />
          </LabeledContent>

          <LabeledContent label="Industry">
            <TextField
              placeholder="Industry"
              defaultValue={values.industry}
              submitLabel="done"
              autocapitalization="words"
              onChangeText={(value) => onFieldChange('industry', value)}
              numberOfLines={1}
              modifiers={[accessibilityLabel('Industry'), fieldWidth]}
            />
          </LabeledContent>

          <LabeledContent label="Tax ID">
            <TextField
              placeholder="Tax ID"
              defaultValue={values.taxId}
              submitLabel="done"
              autocapitalization="characters"
              onChangeText={(value) => onFieldChange('taxId', value)}
              numberOfLines={1}
              modifiers={[accessibilityLabel('Tax ID'), fieldWidth]}
            />
          </LabeledContent>
        </Section>

        <Section title="Billing Address">
          <LabeledContent label="Street">
            <TextField
              placeholder="Street"
              defaultValue={values.street}
              textContentType="street-address-line1"
              submitLabel="done"
              autocapitalization="words"
              onChangeText={(value) => onFieldChange('street', value)}
              numberOfLines={1}
              modifiers={[accessibilityLabel('Street'), fieldWidth]}
            />
          </LabeledContent>

          <LabeledContent label="Number">
            <TextField
              placeholder="Number"
              defaultValue={values.streetNumber}
              textContentType="street-address-line2"
              submitLabel="done"
              autocapitalization="characters"
              onChangeText={(value) => onFieldChange('streetNumber', value)}
              numberOfLines={1}
              modifiers={[accessibilityLabel('Street number'), fieldWidth]}
            />
          </LabeledContent>

          <LabeledContent label="City">
            <TextField
              placeholder="City"
              defaultValue={values.city}
              textContentType="address-city"
              submitLabel="done"
              autocapitalization="words"
              onChangeText={(value) => onFieldChange('city', value)}
              numberOfLines={1}
              modifiers={[accessibilityLabel('City'), fieldWidth]}
            />
          </LabeledContent>

          <LabeledContent label="Province">
            <TextField
              placeholder="Province"
              defaultValue={values.province}
              textContentType="address-state"
              submitLabel="done"
              autocapitalization="words"
              onChangeText={(value) => onFieldChange('province', value)}
              numberOfLines={1}
              modifiers={[accessibilityLabel('Province'), fieldWidth]}
            />
          </LabeledContent>

          <LabeledContent label="Zip Code">
            <TextField
              placeholder="Zip Code"
              defaultValue={values.postalCode}
              textContentType="postal-code"
              submitLabel="done"
              autocapitalization="characters"
              onChangeText={(value) => onFieldChange('postalCode', value)}
              numberOfLines={1}
              modifiers={[accessibilityLabel('Zip code'), fieldWidth]}
            />
          </LabeledContent>

          <LabeledContent label="Country">
            <TextField
              placeholder="Country"
              defaultValue={values.country}
              submitLabel="done"
              autocapitalization="words"
              onChangeText={(value) => onFieldChange('country', value)}
              numberOfLines={1}
              modifiers={[accessibilityLabel('Country'), fieldWidth]}
            />
          </LabeledContent>
        </Section>
      </Form>
    </Host>
  );
}
