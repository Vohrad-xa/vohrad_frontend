import {memo, useCallback, useMemo} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {type Href} from 'expo-router';
import {List, type ListItemProps} from 'react-native-paper';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useAuth, useTheme} from '@/providers';
import {useSafeRouter} from '@/utils';
import {
  AppIcons,
  type IconName,
  makeStyleFactory,
  showConfirmAlert,
} from '@/utils';

type LeftProps = Parameters<NonNullable<ListItemProps['left']>>[0];

type SettingsRowModel = Readonly<{
  id: string;
  title: string;
  description?: string;
  icon: IconName;
  href?: Href;
  onPress?: () => void;
  danger?: boolean;
}>;

const APPEARANCE_OPTIONS = [
  {id: 'light', label: 'Light'},
  {id: 'dark', label: 'Dark'},
  {id: 'system', label: 'System'},
] as const;

const SettingsRow = memo((row: SettingsRowModel) => {
  const router = useSafeRouter();
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const onPress = useCallback(() => {
    if (row.onPress) return row.onPress();
    if (row.href) router.push(row.href);
  }, [router, row]);

  const renderLeft = useCallback(
    (props: LeftProps) => <List.Icon {...props} icon={row.icon} />,
    [row.icon],
  );

  const pressable = Boolean(row.onPress ?? row.href);

  return (
    <List.Item
      title={row.title}
      titleStyle={row.danger ? styles.dangerTitle : undefined}
      description={row.description}
      left={renderLeft}
      onPress={pressable ? onPress : undefined}
      borderless
    />
  );
});

SettingsRow.displayName = 'SettingsRow';

export default function SettingsModal() {
  const {logout} = useAuth();
  const {preference, setScheme, ds, theme} = useTheme();
  const {showActionSheetWithOptions} = useActionSheet();

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

  const handleOpenAppearance = useCallback(() => {
    const options = [...APPEARANCE_OPTIONS.map((o) => o.label), 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        title: 'Appearance',
        options,
        cancelButtonIndex,
        destructiveButtonIndex: cancelButtonIndex,
        containerStyle: {
          backgroundColor: theme.modalBackground,
          borderTopEndRadius: ds.borderRadius.xxxl,
          borderTopStartRadius: ds.borderRadius.xxxl,
        },
        textStyle: {color: theme.text},
        titleTextStyle: {color: theme.muted},
      },
      (index) => {
        if (index == null || index === cancelButtonIndex) return;

        const next = APPEARANCE_OPTIONS[index]?.id;
        if (next && next !== preference) setScheme(next);
      },
    );
  }, [
    ds.borderRadius.xxxl,
    preference,
    setScheme,
    showActionSheetWithOptions,
    theme.modalBackground,
    theme.muted,
    theme.text,
  ]);

  const ROWS = useMemo<readonly SettingsRowModel[]>(
    () => [
      {
        id: 'profile',
        title: 'My Profile',
        description: 'View and edit your profile',
        icon: AppIcons.ui.profile,
        href: '/(app)/(tabs)/settings/profile',
      },
      {
        id: 'organization',
        title: 'Business Details',
        description: 'Manage business information',
        icon: AppIcons.domain.organization,
        href: '/(app)/(tabs)/settings/organization',
      },
      {
        id: 'users',
        title: 'User Management',
        description: 'Manage users and roles',
        icon: AppIcons.ui.userManagement,
        href: '/(app)/(tabs)/settings/users',
      },
      {
        id: 'app-settings',
        title: 'App Settings',
        description: 'Configure application settings',
        icon: AppIcons.ui.settings,
        href: '/(app)/(tabs)/settings/app-settings',
      },
      {
        id: 'appearance',
        title: 'Appearance',
        description: 'Change app theme',
        icon: AppIcons.ui.appearance,
        onPress: handleOpenAppearance,
      },
      {
        id: 'language',
        title: 'App Language',
        description: 'Select your preferred language',
        icon: AppIcons.ui.language,
        href: '/(app)/(tabs)/settings/language',
      },
      {
        id: 'support',
        title: 'Report an Issue',
        description: 'Get support or report a problem',
        icon: AppIcons.ui.support,
        href: '/(app)/(tabs)/settings/support',
      },
      {
        id: 'privacy',
        title: 'Privacy Policy',
        description: 'Read our privacy policy',
        icon: AppIcons.ui.privacy,
        href: '/(app)/(tabs)/settings/privacy',
      },
      {
        id: 'terms',
        title: 'Terms of Use',
        description: 'Read our terms of use',
        icon: AppIcons.ui.terms,
        href: '/(app)/(tabs)/settings/terms',
      },
      {
        id: 'about',
        title: 'About',
        description: 'Learn more about this app',
        icon: AppIcons.ui.info,
        href: '/(app)/(tabs)/settings/about',
      },
      {
        id: 'logout',
        title: 'Logout',
        description: 'Sign out of your account',
        icon: AppIcons.actions.logout,
        onPress: handleLogout,
        danger: true,
      },
    ],
    [handleLogout, handleOpenAppearance],
  );

  return (
    <ScrollView>
      {ROWS.map((row) => (
        <SettingsRow key={row.id} {...row} />
      ))}
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      dangerTitle: {
        color: Palette.red,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
