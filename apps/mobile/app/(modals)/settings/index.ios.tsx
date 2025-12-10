import {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {Host, Picker, List, Button} from '@/modules/sykamore-ui';
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
      <List
        listStyle="insetGrouped"
        refreshEnabled
        showScrollIndicators={false}
      >
        {/* Account Section */}
        <ListSection
          title="Account"
          footer="Manage your account settings and personal information."
        >
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
        <ListSection
          title="General"
          footer="Customize your app experience and preferences"
        >
          <ListSection.Row
            icon={AppIcons.navigation.settings}
            iconColorToken="glassTint"
            title="App Settings"
            onPress={() => router.push('/(modals)/settings/app-settings')}
          />
          <ListSection.Row
            icon={AppIcons.theme.appearance}
            iconColorToken="purple"
            title="Appearance"
            rightComponent={
              <Picker
                label=""
                selection={preference}
                onSelectionChange={({nativeEvent}) => {
                  setScheme(
                    nativeEvent.selection as 'light' | 'dark' | 'system',
                  );
                }}
              >
                <Button
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'light'}]}
                >
                  Light
                </Button>
                <Button
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'dark'}]}
                >
                  Dark
                </Button>
                <Button
                  onPress={() => {}}
                  modifiers={[{$type: 'tag', tag: 'system'}]}
                >
                  Auto
                </Button>
              </Picker>
            }
          />
          <ListSection.Row
            icon={AppIcons.navigation.preferences}
            iconColorToken="accentOrange"
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
        <ListSection
          title="Data & Information"
          footer="Access important legal and informational, including privacy policies and terms of use."
        >
          <ListSection.Row
            icon={AppIcons.content.privacy}
            iconColorToken="purple"
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
            iconColorToken="glassTint"
            title="About"
            onPress={() => router.push('/(modals)/settings/about')}
          />
        </ListSection>

        <ListSection footer="Need help or support? Visit our support center or contact us for assistance.">
          <ListSection.Row
            icon={AppIcons.status.help}
            iconColorToken="iconWarning"
            title="Report an Issue"
            onPress={() => router.push('/(modals)/settings/support')}
          />
        </ListSection>

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
