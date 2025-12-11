import {useCallback} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {router} from 'expo-router';
import {GestureDetector} from 'react-native-gesture-handler';
import {Card} from '@/components/cards/card';
import {ThemedView, ThemedText, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {AppearanceMenu} from '@/features/settings';
import {useTheme, useAuth, useSidebar} from '@/providers';
import {AppIcons, showConfirmAlert, makeStyleFactory} from '@/utils';

export default function SettingsModal() {
  const {ds, theme, scheme} = useTheme();
  const {logout} = useAuth();
  const {mainGesture} = useSidebar();
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

  const content = (
    <ThemedView style={styles.container}>
      <ModalScrollView contentContainerStyle={styles.contentContainer}>
        <Card>
          <Card.Row
            icon={AppIcons.business.profile}
            onPress={() => router.push('/(app)/(tabs)/settings/profile')}
          >
            <ThemedText variant="label">Profile</ThemedText>
          </Card.Row>
          <Card.Divider withIconOffset />
          <Card.Row
            icon={AppIcons.business.organization}
            onPress={() => router.push('/(app)/(tabs)/settings/organization')}
          >
            <ThemedText variant="label">Organization</ThemedText>
          </Card.Row>
        </Card>

        <Card>
          <Card.Row
            icon={AppIcons.navigation.settings}
            onPress={() => router.push('/(app)/(tabs)/settings/app-settings')}
          >
            <ThemedText variant="label">App Settings</ThemedText>
          </Card.Row>
          <Card.Divider withIconOffset />
          <Card.Row
            icon={
              scheme === 'dark' ? AppIcons.theme.light : AppIcons.theme.dark
            }
            hideChevron
          >
            <View style={styles.rowContent}>
              <ThemedText variant="label" style={styles.appearanceLabel}>
                Appearance
              </ThemedText>
              <AppearanceMenu style={styles.appearanceMenuStyle} />
            </View>
          </Card.Row>
          <Card.Divider withIconOffset />
          <Card.Row
            icon={AppIcons.navigation.settings}
            onPress={() => router.push('/(app)/(tabs)/settings/preferences')}
          >
            <ThemedText variant="label">Preferences</ThemedText>
          </Card.Row>
          <Card.Divider withIconOffset />
          <Card.Row
            icon={AppIcons.content.language}
            onPress={() => router.push('/(app)/(tabs)/settings/language')}
          >
            <ThemedText variant="label">App Language</ThemedText>
          </Card.Row>
        </Card>

        <Card>
          <Card.Row
            icon={AppIcons.status.help}
            onPress={() => router.push('/(app)/(tabs)/settings/support')}
          >
            <ThemedText variant="label">Report an Issue</ThemedText>
          </Card.Row>
          <Card.Divider withIconOffset />
          <Card.Row
            icon={AppIcons.content.privacy}
            onPress={() => router.push('/(app)/(tabs)/settings/privacy')}
          >
            <ThemedText variant="label">Privacy Policy</ThemedText>
          </Card.Row>
          <Card.Divider withIconOffset />
          <Card.Row
            icon={AppIcons.content.document}
            onPress={() => router.push('/(app)/(tabs)/settings/terms')}
          >
            <ThemedText variant="label">Terms of Use</ThemedText>
          </Card.Row>
          <Card.Divider withIconOffset />
          <Card.Row
            icon={AppIcons.status.info}
            onPress={() => router.push('/(app)/(tabs)/settings/about')}
          >
            <ThemedText variant="label">About</ThemedText>
          </Card.Row>
        </Card>

        <Card>
          <Card.Row
            icon={AppIcons.actions.logout}
            onPress={handleLogout}
            hideChevron
          >
            <ThemedText variant="label" style={{color: theme.destructive}}>
              Logout
            </ThemedText>
          </Card.Row>
        </Card>
      </ModalScrollView>
    </ThemedView>
  );

  if (Platform.OS === 'web') {
    return content;
  }

  return <GestureDetector gesture={mainGesture}>{content}</GestureDetector>;
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      contentContainer: {
        padding: ds.spacing.lg,
        gap: ds.spacing.lg,
      },

      rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      appearanceMenuStyle: {
        minWidth: '35%',
        maxHeight: 20,
        overflow: 'hidden',
      },
      appearanceLabel: {
        flex: 1,
        minWidth: '70%',
      },
    }),
  (ds, _theme) => themeKey(_theme, ds),
);
