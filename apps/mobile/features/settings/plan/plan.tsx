import {StyleSheet, View} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory, AppIcons, formatDate} from '@/utils';
import {useLicenseInfo} from './use-license-info';

export function PlanScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {license} = useLicenseInfo();

  return (
    <View style={styles.container}>
      <ThemedText variant="value" style={styles.sectionTitle}>
        Active
      </ThemedText>
      <Card>
        <Card.Row hideChevron icon={AppIcons.ui.plan}>
          <ThemedText variant="label">{license?.name}</ThemedText>
          <ThemedText variant="caption" colorToken="muted">
            allows {license?.seats} users
          </ThemedText>
          <ThemedText variant="caption" colorToken="destructive">
            Expires on {formatDate(license?.ends_at)}
          </ThemedText>
        </Card.Row>
      </Card>
      <ThemedText variant="caption" style={styles.helperText}>
        Renewals are handled though external billing providers. Before the
        license expires, a renewal email will be sent to the organization&apos;s
        email address.
      </ThemedText>
      <ThemedText variant="value" style={styles.sectionTitle}>
        License Key
      </ThemedText>
      <Card>
        <Card.Row hideChevron icon={AppIcons.files.folder}>
          <ThemedText variant="footnote">{license?.license_key}</ThemedText>
        </Card.Row>
      </Card>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        gap: ds.spacing.sm,
      },
      sectionTitle: {
        paddingHorizontal: ds.spacing.lg,
      },
      helperText: {
        marginHorizontal: ds.spacing.lg,
        marginBottom: ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
