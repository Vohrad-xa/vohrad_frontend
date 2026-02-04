import {useCallback} from 'react';
import {router} from 'expo-router';
import {Host, Picker, List, Button, listSectionSpacing} from 'sykamore-ui';
import {ListSection} from '@/components/ui/list-section.ios';
import {useTheme, useAuth} from '@/providers';
import {showConfirmAlert} from '@/utils';
import {AppIcons, Icon} from '@/utils/icons';

export default function SettingsModal() {
  const {ds, preference, setScheme} = useTheme();
  const {logout} = useAuth();

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
    <Host style={{flex: 1}}>
      <List
        listStyle="sidebar"
        modifiers={[listSectionSpacing(ds.spacing.xl + ds.spacing.xs)]}
      >
        {/* Account Section */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.ui.profile}
            iconColorToken="accentRed"
            title="My Profile"
            onPress={() => router.push('/(tabs)/settings/profile')}
          />

          <ListSection.Row
            icon={AppIcons.domain.organization}
            iconColorToken="accentBlue"
            title="Business Details"
            onPress={() => router.push('/(tabs)/settings/tenant')}
          />
        </ListSection>

        {/* Preferences Section */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.ui.settings}
            iconColorToken="muted"
            title="App Settings"
            onPress={() => router.push('/(tabs)/settings/app-settings')}
          />

          <Picker
            label="Theme"
            icon={
              <Icon
                name={AppIcons.ui.appearance}
                colorToken="accentPurple"
                useSwiftUI
                container
              />
            }
            selection={preference}
            onSelectionChange={({nativeEvent}) => {
              setScheme(nativeEvent.selection as 'light' | 'dark' | 'system');
            }}
          >
            <Button label="Light" modifiers={[{$type: 'tag', tag: 'light'}]} />
            <Button label="Dark" modifiers={[{$type: 'tag', tag: 'dark'}]} />
            <Button label="Auto" modifiers={[{$type: 'tag', tag: 'system'}]} />
          </Picker>
        </ListSection>

        <ListSection footer="For best results, select the language you mainly speak, if not available, the app will default to English.">
          <ListSection.Row
            icon={AppIcons.ui.language}
            iconColorToken="accentBlue"
            title="App Language"
            onPress={() => router.push('/(tabs)/settings/language')}
          />
        </ListSection>

        {/* Data & Information */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.ui.privacy}
            iconColorToken="accentPurple"
            title="Privacy Policy"
            onPress={() => router.push('/(tabs)/settings/privacy')}
          />
          <ListSection.Row
            icon={AppIcons.ui.terms}
            iconColorToken="accentOrange"
            title="Terms of Use"
            onPress={() => router.push('/(tabs)/settings/terms')}
          />
          <ListSection.Row
            icon={AppIcons.ui.info}
            iconColorToken="muted"
            title="About"
            onPress={() => router.push('/(tabs)/settings/about')}
          />
          <ListSection.Row
            icon={AppIcons.ui.help}
            iconColorToken="accentOrange"
            title="Report an Issue"
            onPress={() => router.push('/(tabs)/settings/support')}
          />
        </ListSection>

        {/* Logout Section */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.actions.logout}
            iconColorToken="accentRed"
            title="Logout"
            onPress={handleLogout}
            hideChevron
          />
        </ListSection>
      </List>
    </Host>
  );
}
