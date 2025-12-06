import {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {Host, Picker, List} from '@expo/ui/swift-ui';
import {router} from 'expo-router';
import {ListSection} from '@/components/ui/list-section.ios';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useAuth} from '@/providers';
import {showConfirmAlert, makeStyleFactory} from '@/utils';
import {AppIcons} from '@/utils/icons';

export default function SettingsModal() {
  const {ds, theme, preference, setScheme} = useTheme();
  const {logout} = useAuth();
  const styles = createStyles(ds, theme);

  const appearanceIndex =
    preference === 'light' ? 0 : preference === 'dark' ? 1 : 2;

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

  return (
    <Host style={styles.host}>
      <List listStyle="automatic">
        {/* Account Section */}
        <ListSection title="Account">
          <ListSection.Row
            icon={AppIcons.business.profile}
            iconColorToken="accentBlue"
            title="Profile"
            onPress={() => router.push('/(modals)/settings/profile')}
          />
          <ListSection.Row
            icon={AppIcons.business.organization}
            iconColorToken="accentGreen"
            title="Organization"
            onPress={() => router.push('/(modals)/settings/organization')}
          />
        </ListSection>
        {/* Preferences Section */}
        <ListSection title="General">
          <ListSection.Row
            icon={AppIcons.navigation.settings}
            iconColorToken="accentOrange"
            title="App Settings"
            onPress={() => router.push('/(modals)/settings/app-settings')}
          />
          <ListSection.Row
            icon={AppIcons.theme.appearance}
            iconColorToken="accentIndigo"
            title="Appearance"
            onPress={() => {}}
            rightComponent={
              <Picker
                options={['Light', 'Dark', 'Auto']}
                selectedIndex={appearanceIndex}
                onOptionSelected={({nativeEvent: {index}}) => {
                  const preferences = ['light', 'dark', 'system'] as const;
                  setScheme(preferences[index]);
                }}
                variant="menu"
                color={theme.muted}
              />
            }
          />
          <ListSection.Row
            icon={AppIcons.navigation.preferences}
            iconColorToken="accentTeal"
            title="Preferences"
            onPress={() => router.push('/(modals)/settings/preferences')}
          />
          <ListSection.Row
            icon={AppIcons.content.language}
            iconColorToken="accentBlue"
            title="App Language"
            onPress={() => router.push('/(modals)/settings/language')}
          />
        </ListSection>

        {/* Data & Information */}
        <ListSection title="Data & Information">
          <ListSection.Row
            icon={AppIcons.content.privacy}
            iconColorToken="accentIndigo"
            title="Privacy Policy"
            onPress={() => router.push('/(modals)/settings/privacy')}
          />
          <ListSection.Row
            icon={AppIcons.content.terms}
            iconColorToken="iconInfo"
            title="Terms of Use"
            onPress={() => router.push('/(modals)/settings/terms')}
          />
          <ListSection.Row
            icon={AppIcons.status.info}
            iconColorToken="iconInfo"
            title="About"
            onPress={() => router.push('/(modals)/settings/about')}
          />
        </ListSection>

        <ListSection.Row
          icon={AppIcons.status.help}
          iconColorToken="iconWarning"
          title="Report an Issue"
          onPress={() => router.push('/(modals)/settings/support')}
        />

        {/* Logout Section */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.actions.logout}
            iconColorToken="destructive"
            title="Logout"
            onPress={handleLogout}
            hideChevron
          />
        </ListSection>
      </List>
    </Host>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      host: {
        flex: 1,
      },
    }),
  (_ds, _theme) => themeKey(_theme, _ds),
);
