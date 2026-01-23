import {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {router} from 'expo-router';
import {ScrollView} from 'react-native-gesture-handler';
import {List} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {
  themeKey,
  type DSShape,
  type ThemeShape,
  type TokenName,
} from '@/constants';
import {AppearanceMenu} from '@/features/settings';
import {useAuth, useTheme} from '@/providers';
import {
  AppIcons,
  Icon,
  type IconName,
  makeStyleFactory,
  showConfirmAlert,
} from '@/utils';

export default function SettingsModal() {
  const {ds, theme} = useTheme();
  const {logout} = useAuth();
  const styles = createStyles(ds, theme);

  const leftIcon = useCallback(
    (iconName: IconName, _colorToken?: TokenName) => {
      function IconWrapper() {
        return (
          <View style={styles.iconContainer}>
            <Icon name={iconName} />
          </View>
        );
      }

      IconWrapper.displayName = `SettingsLeftIcon(${iconName})`;
      return IconWrapper;
    },
    [styles.iconContainer],
  );

  const handleLogout = useCallback(() => {
    showConfirmAlert({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: logout,
    });
  }, [logout]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <List.Item
        title={<ThemedText variant="body">My Profile</ThemedText>}
        description="View and edit your profile"
        left={leftIcon(AppIcons.tabs.profile)}
        onPress={() => router.push('/(app)/(tabs)/settings/profile')}
      />

      <List.Item
        title={<ThemedText variant="body">Business Details</ThemedText>}
        description="Manage business information"
        left={leftIcon(AppIcons.features.organization)}
        onPress={() => router.push('/(app)/(tabs)/settings/business-details')}
      />

      <List.Item
        title={<ThemedText variant="body">User Management</ThemedText>}
        description="Manage users and roles"
        left={leftIcon(AppIcons.features.userManagement)}
        onPress={() => router.push('/(app)/(tabs)/settings/users')}
      />

      <List.Item
        title={<ThemedText variant="body">App Settings</ThemedText>}
        description="Configure application settings"
        left={leftIcon(AppIcons.tabs.settings)}
        onPress={() => router.push('/(app)/(tabs)/settings/app-settings')}
      />

      <List.Item
        style={styles.appearanceItem}
        title={<ThemedText variant="body">Appearance</ThemedText>}
        description="Switch between light and dark mode"
        left={leftIcon(AppIcons.preferences.appearance)}
        right={(props) => <AppearanceMenu style={props.style} />}
      />

      <List.Item
        title={<ThemedText variant="body">Preferences</ThemedText>}
        description="Set your app preferences"
        left={leftIcon(AppIcons.preferences.settings)}
        onPress={() => router.push('/(app)/(tabs)/settings/preferences')}
      />

      <List.Item
        title={<ThemedText variant="body">Plan</ThemedText>}
        description="View and manage your plan"
        left={leftIcon(AppIcons.preferences.plan)}
        onPress={() => router.push('/(app)/(tabs)/settings/plan')}
      />

      <List.Item
        title={<ThemedText variant="body">App Language</ThemedText>}
        description="Select your preferred language"
        left={leftIcon(AppIcons.preferences.language)}
        onPress={() => router.push('/(app)/(tabs)/settings/language')}
      />

      <List.Item
        title={<ThemedText variant="body">Report an Issue</ThemedText>}
        description="Get support or report a problem"
        left={leftIcon(AppIcons.features.support)}
        onPress={() => router.push('/(app)/(tabs)/settings/support')}
      />

      <List.Item
        title={<ThemedText variant="body">Privacy Policy</ThemedText>}
        description="Read our privacy policy"
        left={leftIcon(AppIcons.preferences.privacy)}
        onPress={() => router.push('/(app)/(tabs)/settings/privacy')}
      />

      <List.Item
        title={<ThemedText variant="body">Terms of Use</ThemedText>}
        description="Read our terms of use"
        left={leftIcon(AppIcons.preferences.terms)}
        onPress={() => router.push('/(app)/(tabs)/settings/terms')}
      />

      <List.Item
        title={<ThemedText variant="body">About</ThemedText>}
        description="Learn more about this app"
        left={leftIcon(AppIcons.status.info)}
        onPress={() => router.push('/(app)/(tabs)/settings/about')}
      />

      <List.Item
        title={
          <ThemedText variant="body" style={{color: theme.destructive}}>
            Logout
          </ThemedText>
        }
        left={leftIcon(AppIcons.actions.logout, 'destructive')}
        onPress={handleLogout}
      />
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      contentContainer: {
        paddingHorizontal: ds.spacing.lg,
        paddingVertical: ds.spacing.lg,
      },
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      appearanceItem: {
        paddingRight: 0,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
