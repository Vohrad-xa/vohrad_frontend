import {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {router} from 'expo-router';
import {ScrollView} from 'react-native-gesture-handler';
import {Divider, List} from 'react-native-paper';
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
    (iconName: IconName, colorToken?: TokenName) => {
      function IconWrapper() {
        return (
          <View style={styles.iconContainer}>
            <Icon
              name={iconName}
              colorToken={colorToken}
              withBackground={!!colorToken}
              size={20}
            />
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
        title="My Profile"
        description="View and edit your profile"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.tabs.profile, 'destructive')}
        onPress={() => router.push('/(app)/(tabs)/settings/profile')}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="Business Details"
        description="Manage business information"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.features.organization, 'accentBlue')}
        onPress={() => router.push('/(app)/(tabs)/settings/business-details')}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="User Management"
        description="Manage users and roles"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.features.userManagement, 'accentGreen')}
        onPress={() => router.push('/(app)/(tabs)/settings/users')}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="App Settings"
        description="Configure application settings"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.tabs.settings, 'accentBlue')}
        onPress={() => router.push('/(app)/(tabs)/settings/app-settings')}
      />
      <Divider style={styles.divider} />

      <List.Item
        style={styles.appearanceItem}
        title="Appearance"
        description="Switch between light and dark mode"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.preferences.appearance, 'accentIndigo')}
        right={(props) => <AppearanceMenu style={props.style} />}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="Preferences"
        description="Set your app preferences"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.preferences.settings, 'accentOrange')}
        onPress={() => router.push('/(app)/(tabs)/settings/preferences')}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="Plan"
        description="View and manage your plan"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.preferences.plan, 'accentOrange')}
        onPress={() => router.push('/(app)/(tabs)/settings/plan')}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="App Language"
        description="Select your preferred language"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.preferences.language, 'accentIndigo')}
        onPress={() => router.push('/(app)/(tabs)/settings/language')}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="Report an Issue"
        description="Get support or report a problem"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.features.support, 'accentOrange')}
        onPress={() => router.push('/(app)/(tabs)/settings/support')}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="Privacy Policy"
        description="Read our privacy policy"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.preferences.privacy, 'accentIndigo')}
        onPress={() => router.push('/(app)/(tabs)/settings/privacy')}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="Terms of Use"
        description="Read the terms of use"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.preferences.terms, 'accentIndigo')}
        onPress={() => router.push('/(app)/(tabs)/settings/terms')}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="About"
        description="Learn more about this app"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={leftIcon(AppIcons.status.info, 'accentBlue')}
        onPress={() => router.push('/(app)/(tabs)/settings/about')}
      />
      <Divider style={styles.divider} />

      <List.Item
        title="Logout"
        titleStyle={[styles.itemTitle, {color: theme.destructive}]}
        left={leftIcon(AppIcons.actions.logout, 'destructive')}
        onPress={handleLogout}
      />
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      contentContainer: {
        paddingHorizontal: ds.spacing.lg,
        paddingVertical: ds.spacing.lg,
      },
      itemTitle: {
        ...ds.typography.label,
      },
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      appearanceItem: {
        paddingRight: 0,
      },
      divider: {
        marginLeft: ds.spacing.xxl + ds.spacing.md,
        marginVertical: ds.spacing.xxs,
      },
      description: {
        ...ds.typography.value,
        marginTop: ds.spacing.xs,
        color: theme.muted,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
