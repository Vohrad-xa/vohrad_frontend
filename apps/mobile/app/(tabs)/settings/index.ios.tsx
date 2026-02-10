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
      <List listStyle="sidebar" modifiers={[listSectionSpacing(ds.spacing.xl)]}>
        {/* Account Section */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.ui.profile}
            iconColorToken="accentRed"
            title="Account"
            onPress={() => router.push('/(tabs)/settings/profile')}
          />

          <ListSection.Row
            icon={AppIcons.domain.organization}
            iconColorToken="accentBlue"
            title="Tenant Management"
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

          <ListSection.Row
            icon={AppIcons.ui.language}
            iconColorToken="accentBlue"
            title="Language"
            onPress={() => router.push('/(tabs)/settings/language')}
          />

          <Picker
            label="Appearance"
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

        {/* Data & Information */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.ui.privacy}
            iconColorToken="accentPurple"
            title="Privacy"
            onPress={() => router.push('/(tabs)/settings/privacy')}
          />
          <ListSection.Row
            icon={AppIcons.ui.info}
            iconColorToken="accentOrange"
            title="Help"
            onPress={() => router.push('/(tabs)/settings/support')}
          />
          <ListSection.Row
            icon={AppIcons.ui.help}
            iconColorToken="muted"
            title="Sykamore FAQ"
            onPress={() => router.push('/(tabs)/settings/about')}
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
