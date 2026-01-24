import {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {router} from 'expo-router';
import {ScrollView} from 'react-native-gesture-handler';
import {List} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
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
    (iconName: IconName) => {
      function IconWrapper() {
        return (
          <View style={styles.iconContainer}>
            <Icon name={iconName} size={24} />
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
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <List.Item
        title={<ThemedText variant="body">My Profile</ThemedText>}
        description="View and edit your profile"
        left={leftIcon(AppIcons.ui.profile)}
        onPress={() => router.push('/(app)/(tabs)/settings/profile')}
      />

      <List.Item
        title={<ThemedText variant="body">Business Details</ThemedText>}
        description="Manage business information"
        left={leftIcon(AppIcons.domain.organization)}
        onPress={() => router.push('/(app)/(tabs)/settings/business-details')}
      />

      <List.Item
        title={<ThemedText variant="body">User Management</ThemedText>}
        description="Manage users and roles"
        left={leftIcon(AppIcons.ui.userManagement)}
        onPress={() => router.push('/(app)/(tabs)/settings/users')}
      />

      <List.Item
        title={<ThemedText variant="body">App Settings</ThemedText>}
        description="Configure application settings"
        left={leftIcon(AppIcons.ui.settings)}
        onPress={() => router.push('/(app)/(tabs)/settings/app-settings')}
      />

      <List.Item
        style={styles.appearanceItem}
        title={<ThemedText variant="body">Appearance</ThemedText>}
        description="Switch between light and dark mode"
        left={leftIcon(AppIcons.ui.appearance)}
        right={(props) => <AppearanceMenu style={props.style} />}
      />

      <List.Item
        title={<ThemedText variant="body">Preferences</ThemedText>}
        description="Set your app preferences"
        left={leftIcon(AppIcons.ui.preference)}
        onPress={() => router.push('/(app)/(tabs)/settings/preferences')}
      />

      <List.Item
        title={<ThemedText variant="body">Plan</ThemedText>}
        description="View and manage your plan"
        left={leftIcon(AppIcons.ui.plan)}
        onPress={() => router.push('/(app)/(tabs)/settings/plan')}
      />

      <List.Item
        title={<ThemedText variant="body">App Language</ThemedText>}
        description="Select your preferred language"
        left={leftIcon(AppIcons.ui.language)}
        onPress={() => router.push('/(app)/(tabs)/settings/language')}
      />

      <List.Item
        title={<ThemedText variant="body">Report an Issue</ThemedText>}
        description="Get support or report a problem"
        left={leftIcon(AppIcons.ui.support)}
        onPress={() => router.push('/(app)/(tabs)/settings/support')}
      />

      <List.Item
        title={<ThemedText variant="body">Privacy Policy</ThemedText>}
        description="Read our privacy policy"
        left={leftIcon(AppIcons.ui.privacy)}
        onPress={() => router.push('/(app)/(tabs)/settings/privacy')}
      />

      <List.Item
        title={<ThemedText variant="body">Terms of Use</ThemedText>}
        description="Read our terms of use"
        left={leftIcon(AppIcons.ui.terms)}
        onPress={() => router.push('/(app)/(tabs)/settings/terms')}
      />

      <List.Item
        title={<ThemedText variant="body">About</ThemedText>}
        description="Learn more about this app"
        left={leftIcon(AppIcons.ui.info)}
        onPress={() => router.push('/(app)/(tabs)/settings/about')}
      />

      <List.Item
        title={
          <ThemedText variant="body" style={{color: Palette.red}}>
            Logout
          </ThemedText>
        }
        left={leftIcon(AppIcons.actions.logout)}
        onPress={handleLogout}
      />
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      contentContainer: {
        paddingHorizontal: ds.spacing.lg + 2,
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
