import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import {ThemedText, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  Button as ComposeButton,
  ContextMenu,
  Picker as ComposePicker,
  Submenu,
  Switch as ComposeSwitch,
} from '@/modules/sykamore-ui/src/android';
import {padding, size} from '@/modules/sykamore-ui/src/android/modifiers';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function LanguageScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [notificationChoice, setNotificationChoice] = React.useState<
    number | null
  >(null);
  const [accentChoice, setAccentChoice] = React.useState(1);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = React.useState(true);
  const doggoOptions = React.useMemo(
    () => ['very', 'veery', 'veeery', 'much'],
    [],
  );
  const notificationOptions = React.useMemo(
    () => ['Push', 'Email', 'None'],
    [],
  );
  const accentOptions = React.useMemo(
    () => ['Classic', 'Solarized', 'Contrast'],
    [],
  );

  const segmentedModifiers = React.useMemo(() => [padding(6)], []);
  const segmentedButtonModifiers = React.useMemo(() => [size(118, 44)], []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.text}>Material 3 Components Demo</ThemedText>

        <View style={styles.demoBlock}>
          <ThemedText style={styles.subheading}>Button Variants</ThemedText>
          <View style={styles.buttonGrid}>
            <ComposeButton
              variant="default"
              leadingIcon="filled.Home"
              onPress={() => {}}
              style={styles.button}
            >
              Default
            </ComposeButton>
            <ComposeButton
              variant="elevated"
              leadingIcon="filled.Star"
              onPress={() => {}}
              style={styles.button}
            >
              Elevated
            </ComposeButton>
            <ComposeButton
              variant="outlined"
              leadingIcon="filled.Favorite"
              onPress={() => {}}
              style={styles.button}
            >
              Outlined
            </ComposeButton>
            <ComposeButton
              variant="bordered"
              leadingIcon="filled.Settings"
              onPress={() => {}}
              style={styles.button}
            >
              Bordered
            </ComposeButton>
            <ComposeButton
              variant="borderless"
              leadingIcon="filled.Info"
              onPress={() => {}}
              style={styles.button}
            >
              Borderless
            </ComposeButton>
            <ComposeButton
              variant="elevated"
              leadingIcon="filled.Add"
              trailingIcon="filled.ArrowForward"
              elementColors={{
                containerColor: '#8b5cf6',
                contentColor: '#ffffff',
              }}
              onPress={() => {}}
              style={styles.button}
            >
              Custom Color
            </ComposeButton>
            <ComposeButton
              variant="outlined"
              leadingIcon="filled.Delete"
              color="#ef4444"
              onPress={() => {}}
              style={styles.button}
            >
              Danger
            </ComposeButton>
            <ComposeButton
              variant="default"
              trailingIcon="filled.Lock"
              disabled
              style={styles.button}
            >
              Disabled
            </ComposeButton>
          </View>
        </View>

        <View style={styles.demoBlock}>
          <ThemedText style={styles.subheading}>
            1. Buttons with Icons
          </ThemedText>
          <ContextMenu style={styles.contextMenuSurface}>
            <ContextMenu.Items>
              <ComposeButton
                leadingIcon="filled.Home"
                variant="outlined"
                onPress={() => {}}
              >
                Home
              </ComposeButton>
              <ComposeButton
                trailingIcon="filled.ArrowForward"
                variant="elevated"
                elementColors={{
                  contentColor: 'black',
                }}
                onPress={() => {}}
              >
                Settings
              </ComposeButton>
              <ComposeButton
                leadingIcon="filled.Favorite"
                trailingIcon="filled.ArrowForward"
                variant="bordered"
                onPress={() => {}}
              >
                Favorites
              </ComposeButton>
            </ContextMenu.Items>
            <ContextMenu.Trigger>
              <ComposeButton
                variant="bordered"
                style={styles.menuTriggerButton}
              >
                Show Icon Menu
              </ComposeButton>
            </ContextMenu.Trigger>
          </ContextMenu>
        </View>

        <View style={styles.demoBlock}>
          <ThemedText style={styles.subheading}>
            2. Switches and Toggles
          </ThemedText>
          <ContextMenu style={styles.contextMenuSurface}>
            <ContextMenu.Items>
              <ComposeSwitch
                label="Dark Mode"
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                variant="switch"
                elementColors={{
                  checkedTrackColor: '#8b5cf6',
                  checkedThumbColor: '#ffffff',
                }}
              />
              <ComposeSwitch
                label="Notifications"
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                variant="checkbox"
                elementColors={{
                  checkedColor: '#10b981',
                }}
              />
              <ComposeSwitch
                label="Sound Effects"
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                variant="switch"
              />
            </ContextMenu.Items>
            <ContextMenu.Trigger>
              <ComposeButton
                variant="elevated"
                style={styles.menuTriggerButton}
              >
                Toggle Settings
              </ComposeButton>
            </ContextMenu.Trigger>
          </ContextMenu>
          <ThemedText style={styles.helperText}>
            Dark: {darkModeEnabled ? 'ON' : 'OFF'} | Notifications:{' '}
            {notificationsEnabled ? 'ON' : 'OFF'} | Sound:{' '}
            {soundEnabled ? 'ON' : 'OFF'}
          </ThemedText>
        </View>

        <View style={styles.demoBlock}>
          <ThemedText style={styles.subheading}>
            3. With Submenu (Android shows as section)
          </ThemedText>
          <ContextMenu style={styles.contextMenuSurface}>
            <ContextMenu.Items>
              <ComposeButton leadingIcon="filled.Share" onPress={() => {}}>
                Share
              </ComposeButton>
              <Submenu button={<ComposeButton>Advanced Options</ComposeButton>}>
                <ComposeButton leadingIcon="filled.Edit" onPress={() => {}}>
                  Edit
                </ComposeButton>
                <ComposeButton leadingIcon="filled.Create" onPress={() => {}}>
                  Duplicate
                </ComposeButton>
                <ComposeSwitch
                  label="Auto Sync"
                  value={autoSyncEnabled}
                  onValueChange={setAutoSyncEnabled}
                  variant="checkbox"
                />
              </Submenu>
              <ComposeButton
                leadingIcon="filled.Delete"
                variant="borderless"
                color="#ef4444"
                onPress={() => {}}
              >
                Delete
              </ComposeButton>
            </ContextMenu.Items>
            <ContextMenu.Trigger>
              <ComposeButton
                leadingIcon="filled.Menu"
                variant="outlined"
                style={styles.menuTriggerButton}
              >
                Advanced Menu
              </ComposeButton>
            </ContextMenu.Trigger>
          </ContextMenu>
          <ThemedText style={styles.helperText}>
            Auto Sync: {autoSyncEnabled ? 'Enabled' : 'Disabled'}
          </ThemedText>
        </View>

        <View style={styles.demoBlock}>
          <ThemedText style={styles.subheading}>4. Mixed Components</ThemedText>
          <ContextMenu style={styles.contextMenuSurface}>
            <ContextMenu.Items>
              <ComposeButton
                leadingIcon="filled.Settings"
                elementColors={{
                  containerColor: '#0000ff',
                  contentColor: '#00ff00',
                }}
                onPress={() => {}}
              >
                Choose Theme
              </ComposeButton>
              <ComposePicker
                options={doggoOptions}
                variant="segmented"
                selectedIndex={selectedIndex}
                onOptionSelected={({nativeEvent: {index}}) =>
                  setSelectedIndex(index)
                }
              />
              <ComposeSwitch
                label="Beta Features"
                value={false}
                variant="switch"
                elementColors={{
                  checkedTrackColor: '#f59e0b',
                }}
              />
            </ContextMenu.Items>
            <ContextMenu.Trigger>
              <ComposeButton
                variant="bordered"
                style={styles.menuTriggerButton}
              >
                Mixed Menu
              </ComposeButton>
            </ContextMenu.Trigger>
          </ContextMenu>
          <ThemedText style={styles.helperText}>
            Doggo love level: {doggoOptions[selectedIndex]}
          </ThemedText>
        </View>

        <View style={styles.demoBlock}>
          <ThemedText style={styles.subheading}>5. Radio Picker</ThemedText>
          <ComposePicker
            options={notificationOptions}
            variant="radio"
            selectedIndex={notificationChoice}
            onOptionSelected={({nativeEvent: {index}}) =>
              setNotificationChoice(index)
            }
            style={styles.radioSurface}
          />
          <ThemedText style={styles.helperText}>
            Notifications:{' '}
            {notificationChoice === null
              ? 'Choose delivery channel'
              : notificationOptions[notificationChoice]}
          </ThemedText>
        </View>

        <View style={styles.demoBlock}>
          <ThemedText style={styles.subheading}>
            6. Segmented with Custom Colors
          </ThemedText>
          <ComposePicker
            options={accentOptions}
            selectedIndex={accentChoice}
            onOptionSelected={({nativeEvent: {index}}) =>
              setAccentChoice(index)
            }
            elementColors={{
              activeBorderColor: '#8b5cf6',
              activeContentColor: '#8b5cf6',
              inactiveBorderColor: '#272b3d',
              inactiveContentColor: '#8792b7',
              activeContainerColor: '#1e1b4b',
              inactiveContainerColor: '#0f172a',
            }}
            modifiers={segmentedModifiers}
            buttonModifiers={segmentedButtonModifiers}
          />
          <ThemedText style={styles.helperText}>
            Accent palette: {accentOptions[accentChoice]}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      scrollView: {
        flex: 1,
        paddingHorizontal: ds.spacing.xl,
        paddingVertical: ds.spacing.xl,
      },
      demoBlock: {
        width: '100%',
        alignItems: 'center',
        marginTop: ds.spacing.xl,
        marginBottom: ds.spacing.md,
      },
      buttonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: ds.spacing.md,
        width: '100%',
        justifyContent: 'center',
      },
      button: {
        minWidth: 160,
      },
      subheading: {
        ...ds.typography.body,
        color: theme.text,
        alignSelf: 'flex-start',
        marginBottom: ds.spacing.sm,
        fontWeight: '600',
      },
      text: {
        ...ds.typography.sectionTitle,
        color: theme.text,
        marginBottom: ds.spacing.lg,
      },
      contextMenuSurface: {
        width: 220,
        height: 52,
        marginTop: ds.spacing.md,
      },
      menuTriggerButton: {
        width: 220,
        height: 52,
      },
      radioSurface: {
        width: '100%',
      },
      helperText: {
        marginTop: ds.spacing.md,
        color: theme.text,
        textAlign: 'center',
        fontSize: 13,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
