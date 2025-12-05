import {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {
  Host,
  Section,
  HStack,
  Image,
  Label,
  Spacer,
  Picker,
  List,
} from '@expo/ui/swift-ui';
import {router} from 'expo-router';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useAuth} from '@/providers';
import {showConfirmAlert, makeStyleFactory} from '@/utils';
import {Icon, AppIcons} from '@/utils/icons';

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
      <List>
        {/* Account Section */}
        <Section title="Account">
          <HStack
            alignment="center"
            onPress={() => router.push('/(modals)/settings/profile')}
            spacing={10}
          >
            <Icon
              name={AppIcons.business.profile}
              colorToken="accentBlue"
              useSwiftUI
            />
            <Label title="Profile" fixedSize={false} />
            <Spacer />
            <Image systemName="chevron.right" size={14} color="secondary" />
          </HStack>

          <HStack
            alignment="center"
            onPress={() => router.push('/(modals)/settings/organization')}
            spacing={10}
          >
            <Icon
              name={AppIcons.business.organization}
              colorToken="accentGreen"
              useSwiftUI
            />
            <Label title="Organization" fixedSize={false} />
            <Spacer />
            <Image systemName="chevron.right" size={14} color="secondary" />
          </HStack>
        </Section>

        {/* Preferences Section */}
        <Section title="App Settings">
          <HStack
            spacing={10}
            alignment="center"
            onPress={() => router.push('/(modals)/settings/app-settings')}
          >
            <Icon
              name={AppIcons.navigation.settings}
              colorToken="accentOrange"
              useSwiftUI
            />
            <Label title="App Settings" fixedSize={false} />
            <Spacer />
            <Image systemName="chevron.right" size={14} color="secondary" />
          </HStack>

          {/* Appearance Picker Row */}
          <HStack alignment="center" onPress={() => {}} spacing={10}>
            <Icon
              name={AppIcons.theme.appearance}
              colorToken="accentIndigo"
              useSwiftUI
            />
            <Label title="Appearance" fixedSize={false} />
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
          </HStack>

          <HStack
            alignment="center"
            onPress={() => router.push('/(modals)/settings/preferences')}
            spacing={10}
          >
            <Icon
              name={AppIcons.navigation.preferences}
              colorToken="accentTeal"
              useSwiftUI
            />
            <Label title="Preferences" fixedSize={false} />
            <Spacer />
            <Image systemName="chevron.right" size={14} color="secondary" />
          </HStack>

          <HStack
            alignment="center"
            onPress={() => router.push('/(modals)/settings/language')}
            spacing={10}
          >
            <Icon
              name={AppIcons.content.language}
              colorToken="accentBlue"
              useSwiftUI
            />
            <Label title="App Language" fixedSize={false} />
            <Spacer />
            <Image systemName="chevron.right" size={14} color="secondary" />
          </HStack>
        </Section>

        {/* Support Section */}
        <Section title="Support & Legal">
          <HStack
            alignment="center"
            onPress={() => router.push('/(modals)/settings/support')}
            spacing={10}
          >
            <Icon
              name={AppIcons.status.help}
              colorToken="iconWarning"
              useSwiftUI
            />
            <Label title="Report an Issue" fixedSize={false} />
            <Spacer />
            <Image systemName="chevron.right" size={14} color="secondary" />
          </HStack>

          <HStack
            alignment="center"
            onPress={() => router.push('/(modals)/settings/privacy')}
            spacing={10}
          >
            <Icon
              name={AppIcons.content.privacy}
              colorToken="accentIndigo"
              useSwiftUI
            />
            <Label title="Privacy Policy" fixedSize={false} />
            <Spacer />
            <Image systemName="chevron.right" size={14} color="secondary" />
          </HStack>

          <HStack
            alignment="center"
            onPress={() => router.push('/(modals)/settings/terms')}
            spacing={10}
          >
            <Icon
              name={AppIcons.content.terms}
              colorToken="iconInfo"
              useSwiftUI
            />
            <Label title="Terms of Use" fixedSize={false} />
            <Spacer />
            <Image systemName="chevron.right" size={14} color="secondary" />
          </HStack>

          <HStack
            alignment="center"
            onPress={() => router.push('/(modals)/settings/about')}
            spacing={10}
          >
            <Icon
              name={AppIcons.status.info}
              colorToken="iconInfo"
              useSwiftUI
            />
            <Label title="About" fixedSize={false} />
            <Spacer />
            <Image systemName="chevron.right" size={14} color="secondary" />
          </HStack>
        </Section>

        {/* Logout Section */}
        <Section>
          <HStack alignment="center" onPress={handleLogout} spacing={10}>
            <Icon
              name={AppIcons.actions.logout}
              colorToken="destructive"
              useSwiftUI
            />
            <Label title="Logout" fixedSize={false} />
          </HStack>
        </Section>
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
