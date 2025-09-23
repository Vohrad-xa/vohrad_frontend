import {StyleSheet, Platform, View, TouchableOpacity, ScrollView, Switch} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ThemedText, ThemedView, Divider} from '@/components/ui';
import {useTheme} from '@/providers';
import {Icon, AppIcons, type IconName} from '@/utils';
import type {DesignSystem} from '@/constants/typography';

interface SettingsItem {
  icon: IconName;
  label: string;
  onPress?: () => void;
  hasToggle?: boolean;
  isDestructive?: boolean;
}

const settingsItems: SettingsItem[] = [
  {icon: AppIcons.business.profile, label: 'Profile'},
  {icon: AppIcons.theme.dark, label: 'Appearance', hasToggle: true},
  {icon: AppIcons.navigation.settings, label: 'Preferences'},
  {icon: AppIcons.content.language, label: 'App Language'},
  {icon: AppIcons.status.help, label: 'Report an Issue'},
  {icon: AppIcons.business.organization, label: 'Organization'},
  {icon: AppIcons.business.plan, label: 'Plan'},
  {icon: AppIcons.content.privacy, label: 'Privacy Policy'},
  {icon: AppIcons.content.document, label: 'Terms of Use'},
  {icon: AppIcons.status.info, label: 'About'},
];

const destructiveItems: SettingsItem[] = [{icon: AppIcons.actions.logout, label: 'Logout', isDestructive: true}];

export default function SettingsModal() {
  const {ds, theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds);

  const renderSettingsItem = ({item}: {item: SettingsItem}) => (
    <TouchableOpacity style={styles.settingsItem} onPress={item.onPress}>
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={ds.iconSize.md} color={item.isDestructive ? theme.iconDanger : undefined} />
      </View>
      <ThemedText style={[styles.labelText, item.isDestructive && {color: theme.iconDanger}]}>{item.label}</ThemedText>
      {item.hasToggle ? (
        <Switch value={false} onValueChange={() => {}} />
      ) : (
        !item.isDestructive && <Icon name={AppIcons.navigation.forward} size={ds.iconSize.md} color={theme.muted} />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{paddingTop: insets.top + (Platform.OS === 'android' ? 0 : ds.spacing.xxl)}}
        showsVerticalScrollIndicator={false}>
        {settingsItems.map((item, index) => (
          <View key={index}>
            {renderSettingsItem({item})}
            {(index === 0 || index === 4 || index === 6) && <Divider style={styles.divider} />}
          </View>
        ))}

        <Divider style={styles.divider} />

        {destructiveItems.map((item, index) => (
          <View key={`destructive-${index}`}>{renderSettingsItem({item})}</View>
        ))}
      </ScrollView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ThemedView>
  );
}

const createStyles = (ds: typeof DesignSystem) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: ds.spacing.md,
      paddingHorizontal: ds.spacing.xl,
    },
    iconContainer: {
      marginRight: ds.spacing.lg,
      width: ds.iconSize.md,
      alignItems: 'center',
    },
    labelText: {
      flex: 1,
      ...ds.typography.body,
      fontWeight: ds.fontWeight.medium,
    },
    divider: {
      marginHorizontal: ds.spacing.xl,
      marginVertical: ds.spacing.sm,
    },
  });
