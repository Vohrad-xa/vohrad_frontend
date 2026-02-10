import {ScrollView, StyleSheet} from 'react-native';
import {Avatar, List} from 'react-native-paper';
import {ThemedText, ListRows, type ListRowProps} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape, Palette} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import {TENANT_FIELDS} from '../constants/organization-constants';
import {useTenantDetails} from '../hooks/use-tenant-details';

const TENANT_ROWS = [
  TENANT_FIELDS.info,
  TENANT_FIELDS.license,
  TENANT_FIELDS.businessHours,
  TENANT_FIELDS.users,
] as const satisfies readonly ListRowProps[];

export function TenantDetailsContent() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {title, subtitle, avatarLabel} = useTenantDetails();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <List.Item
        title={<ThemedText variant="title1">{title}</ThemedText>}
        description={<ThemedText variant="caption">{subtitle}</ThemedText>}
        right={() => (
          <Avatar.Text
            label={avatarLabel}
            labelStyle={{letterSpacing: 2}}
            accessibilityLabel={`${title} avatar`}
            color={Palette.deepblue}
            size={50}
          />
        )}
      />

      <List.Section>
        <ListRows rows={TENANT_ROWS} />
      </List.Section>
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {flex: 1},
      content: {paddingHorizontal: ds.spacing.md},
    }),
  (ds, theme) => themeKey(theme, ds),
);
