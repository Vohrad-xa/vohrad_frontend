import React from 'react';
import {StyleSheet, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {ScrollView} from 'react-native-gesture-handler';
import {FAB, List, TextInput} from 'react-native-paper';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {AppIcons, formatDate, makeStyleFactory} from '@/utils';
import {useLicenseInfo} from './use-license-info';

export function LicenseView() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {license} = useLicenseInfo();

  const licenseName = license?.name ?? 'No active plan';
  const seatsLabel =
    typeof license?.seats === 'number'
      ? `Allows ${license.seats} users`
      : 'Seats not available';
  const expiryLabel = license?.ends_at
    ? `Expires on ${formatDate(license.ends_at)}`
    : 'No expiration date';
  const licenseKeyValue = license?.license_key ?? '';
  const hasLicenseKey = licenseKeyValue.length > 0;

  const handleCopyKey = React.useCallback(() => {
    if (!hasLicenseKey) return;
    Clipboard.setString(licenseKeyValue);
  }, [hasLicenseKey, licenseKeyValue]);

  const handleContactPress = React.useCallback(() => {}, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <List.Section title="Active">
          <List.Item title={licenseName} description={seatsLabel} />
          <List.Item
            title="Expiry"
            description={expiryLabel}
            descriptionStyle={styles.description}
          />
          <List.Item title="License Key" />
          <TextInput
            label="Key"
            value={licenseKeyValue}
            placeholder={hasLicenseKey ? undefined : 'Not available'}
            secureTextEntry={hasLicenseKey}
            editable={false}
            mode="outlined"
            style={styles.keyInput}
            right={
              <TextInput.Icon
                icon="content-copy"
                disabled={!hasLicenseKey}
                onPress={handleCopyKey}
              />
            }
          />
        </List.Section>

        <List.Section title="Renewals">
          <List.Item
            title="Billing"
            description="Renewals are handled through external billing providers. Before the license expires, a renewal email will be sent to the organization's email address."
            descriptionNumberOfLines={3}
            borderless
          />
        </List.Section>
      </ScrollView>

      <FAB
        icon={AppIcons.ui.support}
        onPress={handleContactPress}
        style={styles.fab}
        accessibilityLabel="Contact support"
        rippleColor={theme.ripple}
        color={theme.icon}
        variant="secondary"
      />
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },

      fab: {
        position: 'absolute',
        right: ds.spacing.xl,
        bottom: ds.spacing.xl,
      },
      keyInput: {
        marginHorizontal: ds.spacing.lg,
      },
      description: {
        color: Palette.red,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
