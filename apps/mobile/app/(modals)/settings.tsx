import {StyleSheet, Platform, View, TouchableOpacity, ScrollView} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ThemedText, ThemedView} from '@/components/ui';
import {useTheme} from '@/providers';
import {Icon, AppIcons, type IconName} from '@/utils';
import type {DesignSystem} from '@/constants/typography';

interface SettingsItem {
  icon: IconName;
  label: string;
  onPress?: () => void;
}

const settingsItems: SettingsItem[] = [
  {icon: AppIcons.business.profile, label: 'Profile'},
  {icon: AppIcons.navigation.settings, label: 'Preferences'},
  {icon: AppIcons.status.info, label: 'About'},
  {icon: AppIcons.business.suppliers, label: 'Account'},
];

export default function SettingsModal() {
  const {ds, theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds);

  const renderSettingsItem = ({item}: {item: SettingsItem}) => (
    <TouchableOpacity style={styles.settingsItem} onPress={item.onPress}>
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={ds.iconSize.lg} />
      </View>
      <ThemedText style={styles.labelText}>{item.label}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{paddingTop: insets.top}}
        showsVerticalScrollIndicator={false}>
        {settingsItems.map((item, index) => (
          <View key={index}>{renderSettingsItem({item})}</View>
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
      padding: ds.layout.screenPadding,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: ds.spacing.lg,
      paddingHorizontal: ds.spacing.md,
      marginBottom: ds.spacing.xs,
      borderRadius: ds.borderRadius.lg,
    },
    iconContainer: {
      marginRight: ds.spacing.lg,
    },
    labelText: {
      flex: 1,
      ...ds.typography.body,
      fontWeight: ds.fontWeight.medium,
    },
  });
