import {useCallback} from 'react';
import {StyleSheet, Platform, View} from 'react-native';
import {router} from 'expo-router';
import {GestureDetector, ScrollView} from 'react-native-gesture-handler';
import {List, Divider} from 'react-native-paper';
import {type TokenName} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {AppearanceMenu} from '@/features/settings';
import {useTheme, useAuth, useSidebar} from '@/providers';
import {Icon, showConfirmAlert, makeStyleFactory} from '@/utils';

export default function SettingsModal() {
  const {ds, theme, scheme} = useTheme();
  const {logout} = useAuth();
  const {mainGesture} = useSidebar();
  const styles = createStyles(ds, theme);

  const renderIcon = (iconName: string, colorToken?: TokenName) => {
    const IconWrapper = () => (
      <View style={styles.iconContainer}>
        <Icon
          name={iconName}
          size="sm"
          colorToken={colorToken}
          withBackground={!!colorToken}
        />
      </View>
    );
    IconWrapper.displayName = 'IconWrapper';
    return IconWrapper;
  };

  const handleLogout = useCallback(() => {
    showConfirmAlert({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: () => {
        logout();
      },
    });
  }, [logout]);

  const content = (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <List.Item
        title="Profile"
        description="View and edit your profile"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon('person', 'accentBlue')}
        onPress={() => router.push('/(app)/(tabs)/settings/profile')}
      />
      <Divider style={styles.divider} />
      <List.Item
        title="Organization"
        description="Manage organization settings"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon('people', 'accentGreen')}
        onPress={() => router.push('/(app)/(tabs)/settings/organization')}
      />
      <Divider style={styles.divider} />
      <List.Item
        title="App Settings"
        description="Configure application settings"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon('cog-outline', 'accentBlue')}
        onPress={() => router.push('/(app)/(tabs)/settings/app-settings')}
      />
      <Divider style={styles.divider} />
      <List.Item
        style={styles.apperanceItem}
        title="Appearance"
        description="Switch between light and dark mode"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon(scheme === 'dark' ? 'sunny' : 'moon', 'purple')}
        right={() => <AppearanceMenu />}
      />
      <Divider style={styles.divider} />
      <List.Item
        title="Preferences"
        description="Set your app preferences"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon('options', 'accentOrange')}
        onPress={() => router.push('/(app)/(tabs)/settings/preferences')}
      />
      <Divider style={styles.divider} />
      <List.Item
        title="App Language"
        description="Select your preferred language"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon('planet', 'accentTeal')}
        onPress={() => router.push('/(app)/(tabs)/settings/language')}
      />
      <Divider style={styles.divider} />
      <List.Item
        title="Report an Issue"
        description="Get support or report a problem"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon('help-circle', 'accentOrange')}
        onPress={() => router.push('/(app)/(tabs)/settings/support')}
      />
      <Divider style={styles.divider} />
      <List.Item
        title="Privacy Policy"
        description="Read our privacy policy"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon('lock-closed', 'accentIndigo')}
        onPress={() => router.push('/(app)/(tabs)/settings/privacy')}
      />
      <Divider style={styles.divider} />
      <List.Item
        title="Terms of Use"
        description="Read the terms of use"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon('document-text', 'accentIndigo')}
        onPress={() => router.push('/(app)/(tabs)/settings/terms')}
      />
      <Divider style={styles.divider} />
      <List.Item
        title="About"
        description="Learn more about this app"
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon('information-circle', 'accentBlue')}
        onPress={() => router.push('/(app)/(tabs)/settings/about')}
      />
      <Divider style={styles.divider} />
      <List.Item
        title="Logout"
        titleStyle={[styles.itemTitle, {color: theme.destructive}]}
        left={renderIcon('sign-out', 'destructive')}
        onPress={handleLogout}
      />
    </ScrollView>
  );

  if (Platform.OS === 'web') {
    return content;
  }

  return <GestureDetector gesture={mainGesture}>{content}</GestureDetector>;
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      contentContainer: {
        paddingHorizontal: ds.spacing.xl,
      },
      itemTitle: {
        ...ds.typography.label,
      },
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      apperanceItem: {
        paddingRight: 0,
      },
      divider: {
        marginLeft: ds.spacing.xl * 2 + ds.spacing.xxs,
      },
      description: {
        ...ds.typography.value,
        marginTop: ds.spacing.xs,
        color: theme.muted,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
