import {useCallback} from 'react';
import {router} from 'expo-router';
import {Host, Picker, List, Button} from 'sykamore-ui';
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
    <Host style={{flex: 1}} matchContents>
      <List
        listStyle="automatic"
        showScrollIndicators={false}
        sectionSpacing={ds.spacing.xxl}
      >
        {/* Account Section */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.tabs.profile}
            iconColorToken="destructive"
            title="My Profile"
            onPress={() => router.push('/(app)/(tabs)/settings/profile')}
          />
        </ListSection>
        {/* Organization Section */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.features.organization}
            iconColorToken="accentBlue"
            title="Business Details"
            onPress={() =>
              router.push('/(app)/(tabs)/settings/business-details')
            }
          />
          <ListSection.Row
            icon={AppIcons.features.userManagement}
            iconColorToken="accentGreen"
            title="User Management"
            onPress={() => router.push('/(app)/(tabs)/settings/users')}
          />
          <ListSection.Row
            icon={AppIcons.preferences.settings}
            iconColorToken="accentOrange"
            title="Preferences"
            onPress={() => router.push('/(app)/(tabs)/settings/preferences')}
          />
          <ListSection.Row
            icon={AppIcons.preferences.plan}
            iconColorToken="accentOrange"
            title="Plan"
            onPress={() => router.push('/(app)/(tabs)/settings/plan')}
          />
        </ListSection>

        {/* Preferences Section */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.tabs.settings}
            iconColorToken="glassTint"
            title="App Settings"
            onPress={() => router.push('/(app)/(tabs)/settings/app-settings')}
          />

          <Picker
            label="Theme"
            icon={
              <Icon
                name={AppIcons.preferences.appearance}
                colorToken="accentPurple"
                useSwiftUI
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
            icon={AppIcons.preferences.language}
            iconColorToken="accentBlue"
            title="App Language"
            onPress={() => router.push('/(app)/(tabs)/settings/language')}
          />
        </ListSection>

        {/* Data & Information */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.preferences.privacy}
            iconColorToken="accentPurple"
            title="Privacy Policy"
            onPress={() => router.push('/(app)/(tabs)/settings/privacy')}
          />
          <ListSection.Row
            icon={AppIcons.preferences.terms}
            iconColorToken="accentOrange"
            title="Terms of Use"
            onPress={() => router.push('/(app)/(tabs)/settings/terms')}
          />
          <ListSection.Row
            icon={AppIcons.status.info}
            iconColorToken="glassTint"
            title="About"
            onPress={() => router.push('/(app)/(tabs)/settings/about')}
          />
          <ListSection.Row
            icon={AppIcons.status.help}
            iconColorToken="accentOrange"
            title="Report an Issue"
            onPress={() => router.push('/(app)/(tabs)/settings/support')}
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
