import {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {router} from 'expo-router';
import {ListSection} from '@/components/ui/list-section.ios';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {Host, Picker, List, Button} from '@/modules/sykamore-ui';
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
    <Host style={styles.host} matchContents>
      <List
        listStyle="insetGrouped"
        showScrollIndicators={false}
        sectionSpacing={ds.spacing.xxl}
      >
        {/* Account Section */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.business.profile}
            iconColorToken="accentBlue"
            title="Profile"
            onPress={() => router.push('/(app)/(tabs)/settings/profile')}
          />
          <ListSection.Row
            icon={AppIcons.business.organization}
            iconColorToken="accentGreen"
            title="Organization"
            onPress={() => router.push('/(app)/(tabs)/settings/organization')}
          />
        </ListSection>
        {/* Preferences Section */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.navigation.settings}
            iconColorToken="glassTint"
            title="App Settings"
            onPress={() => router.push('/(app)/(tabs)/settings/app-settings')}
          />

          <Picker
            label="Theme"
            systemImage="moon.fill"
            selection={preference}
            onSelectionChange={({nativeEvent}) => {
              setScheme(nativeEvent.selection as 'light' | 'dark' | 'system');
            }}
          >
            <Button modifiers={[{$type: 'tag', tag: 'light'}]}>Light</Button>
            <Button modifiers={[{$type: 'tag', tag: 'dark'}]}>Dark</Button>
            <Button modifiers={[{$type: 'tag', tag: 'system'}]}>Auto</Button>
          </Picker>

          <ListSection.Row
            icon={AppIcons.navigation.preferences}
            iconColorToken="accentOrange"
            title="Preferences"
            onPress={() => router.push('/(app)/(tabs)/settings/preferences')}
          />
        </ListSection>

        <ListSection footer="For best results, select the language you mainly speak, if not available, the app will default to English.">
          <ListSection.Row
            icon={AppIcons.content.language}
            iconColorToken="accentBlue"
            title="App Language"
            onPress={() => router.push('/(app)/(tabs)/settings/language')}
          />
        </ListSection>

        {/* Data & Information */}
        <ListSection>
          <ListSection.Row
            icon={AppIcons.content.privacy}
            iconColorToken="purple"
            title="Privacy Policy"
            onPress={() => router.push('/(app)/(tabs)/settings/privacy')}
          />
          <ListSection.Row
            icon={AppIcons.content.terms}
            iconColorToken="iconInfo"
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
            iconColorToken="iconWarning"
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

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      host: {
        flex: 1,
      },
    }),
  (_ds, _theme) => themeKey(_theme, _ds),
);
