import {useMemo} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import {BlurView} from 'expo-blur';
import {useRouter} from 'expo-router';
import {StatusBar as ExpoStatusBar} from 'expo-status-bar';
import Animated, {useAnimatedStyle, useSharedValue, withTiming, interpolateColor} from 'react-native-reanimated';
import {ThemedText, ThemedView, Divider, Switch, HeaderButton} from '@/components/ui';
import type {Tokens, ColorScheme} from '@/constants/colors';
import {Palette} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';
import type {MenuItemProps} from '@/types/ui';
import {Icon, AppIcons} from '@/utils';

interface SettingsItem extends Omit<MenuItemProps, 'onPress'> {
  id: string;
  onPress?: () => void;
  showDividerAfter?: boolean;
}

interface ToggleSettingsItem extends SettingsItem {
  hasToggle: true;
}

const destructiveItems: SettingsItem[] = [
  {
    id: 'logout',
    icon: AppIcons.actions.logout,
    label: 'Logout',
    isDestructive: true,
    onPress: () => {
      // TODO: Implement logout functionality
    },
  },
];

export default function SettingsModal() {
  const {ds, theme, scheme} = useTheme();
  const navigation = useRouter();
  const styles = createStyles(ds, theme, scheme);
  const headerBorderOpacity = useSharedValue(0);

  // Type-safe settings items with computed values
  const computedSettingsItems: Array<SettingsItem | ToggleSettingsItem> = useMemo(
    () => [
      {
        id: 'profile',
        icon: AppIcons.business.profile,
        label: 'Profile',
        showDividerAfter: true,
        onPress: () => {
          // TODO: Navigate to profile screen
        },
      },
      {
        id: 'appearance',
        icon: AppIcons.theme.dark,
        label: 'Appearance',
        hasToggle: true,
      },
      {
        id: 'preferences',
        icon: AppIcons.navigation.settings,
        label: 'Preferences',
        onPress: () => {
          // TODO: Navigate to preferences screen
        },
      },
      {
        id: 'language',
        icon: AppIcons.content.language,
        label: 'App Language',
        onPress: () => {
          // TODO: Navigate to language selection screen
        },
      },
      {
        id: 'support',
        icon: AppIcons.status.help,
        label: 'Report an Issue',
        showDividerAfter: true,
        onPress: () => {
          // TODO: Navigate to support screen
        },
      },
      {
        id: 'organization',
        icon: AppIcons.business.organization,
        label: 'Organization',
        onPress: () => {
          // TODO: Navigate to organization screen
        },
      },
      {
        id: 'plan',
        icon: AppIcons.business.plan,
        label: 'Plan',
        showDividerAfter: true,
        onPress: () => {
          // TODO: Navigate to plan screen
        },
      },
      {
        id: 'privacy',
        icon: AppIcons.content.privacy,
        label: 'Privacy Policy',
        onPress: () => {
          // TODO: Navigate to privacy policy screen
        },
      },
      {
        id: 'terms',
        icon: AppIcons.content.document,
        label: 'Terms of Use',
        onPress: () => {
          // TODO: Navigate to terms of use screen
        },
      },
      {
        id: 'about',
        icon: AppIcons.status.info,
        label: 'About',
        onPress: () => {
          // TODO: Navigate to about screen
        },
      },
    ],
    [],
  );

  const renderSettingsItem = ({item}: {item: SettingsItem | ToggleSettingsItem}) => {
    const isToggleItem = (item: SettingsItem | ToggleSettingsItem): item is ToggleSettingsItem =>
      'hasToggle' in item && item.hasToggle === true;

    const content = (
      <>
        <View style={styles.iconContainer}>
          <Icon name={item.icon} size={ds.iconSize.md} color={item.isDestructive ? theme.iconDanger : undefined} />
        </View>
        <ThemedText style={[styles.labelText, item.isDestructive && dynamicStyles.destructiveText]}>
          {item.label}
        </ThemedText>
        {isToggleItem(item) ? (
          <View style={styles.switchContainer}>
            <Switch />
          </View>
        ) : (
          !item.isDestructive && <Icon name={AppIcons.navigation.forward} size={ds.iconSize.md} color={theme.muted} />
        )}
      </>
    );

    return item.onPress ? (
      <TouchableOpacity style={styles.settingsItem} onPress={item.onPress}>
        {content}
      </TouchableOpacity>
    ) : (
      <View style={styles.settingsItem}>{content}</View>
    );
  };

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.back();
    } else {
      navigation.replace('/');
    }
  };

  const renderHeaderContent = () => (
    <View style={styles.headerContent}>
      <ThemedText style={styles.headerTitle}>Settings</ThemedText>
      <View style={styles.closeButtonContainer}>
        <HeaderButton icon={AppIcons.navigation.close} accessibilityLabel="Close" onPress={handleClose} />
      </View>
    </View>
  );

  const topPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + ds.spacing.lg : ds.spacing.lg;

  const headerHeight =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + ds.spacing.lg + ds.spacing.md * 2 + ds.iconSize.lg
      : ds.spacing.lg + ds.spacing.md * 2 + ds.iconSize.lg;

  // Memoize dynamic styles to prevent object recreation
  const dynamicStyles = useMemo(
    () => ({
      headerWithPadding: {paddingTop: topPadding},
      destructiveText: {color: theme.iconDanger},
      scrollContent: {paddingTop: headerHeight},
    }),
    [topPadding, theme.iconDanger, headerHeight],
  );

  const headerStyle = useAnimatedStyle(() => ({
    borderBottomWidth: 0.2,
    borderBottomColor: interpolateColor(headerBorderOpacity.value, [0, 0.3], ['transparent', Palette.creme]),
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: headerBorderOpacity.value,
  }));

  const fallbackStyle = useAnimatedStyle(() => ({
    opacity: 1 - headerBorderOpacity.value,
  }));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset} = event.nativeEvent;
    const scrollY = contentOffset.y;

    headerBorderOpacity.value = withTiming(scrollY > 10 ? 1 : 0, {
      duration: 200,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContentContainer, dynamicStyles.scrollContent]}
        showsVerticalScrollIndicator
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {computedSettingsItems.map((item) => (
          <View key={item.id}>
            {renderSettingsItem({item})}
            {item.showDividerAfter && <Divider style={styles.divider} />}
          </View>
        ))}

        <Divider style={styles.divider} />

        {destructiveItems.map((item) => (
          <View key={item.id}>{renderSettingsItem({item})}</View>
        ))}
      </ScrollView>

      <View style={styles.absoluteTop}>
        <Animated.View style={[styles.headerBlur, blurStyle, headerStyle]}>
          <BlurView
            intensity={40}
            tint={scheme === 'dark' ? 'dark' : 'light'}
            style={[styles.headerBase, dynamicStyles.headerWithPadding]}>
            {renderHeaderContent()}
          </BlurView>
        </Animated.View>
        <Animated.View
          style={[styles.headerBase, styles.headerFallback, fallbackStyle, dynamicStyles.headerWithPadding]}>
          {renderHeaderContent()}
        </Animated.View>
      </View>
      <ExpoStatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ThemedView>
  );
}

const createStyles = (ds: typeof DesignSystem, theme: typeof Tokens.light | typeof Tokens.dark, _scheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingHorizontal: ds.spacing.xl,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: ds.spacing.md,
    },
    iconContainer: {
      marginRight: ds.spacing.lg,
      width: ds.iconSize.md,
      alignItems: 'center',
    },
    labelText: {
      flex: 1,
      ...ds.typography.body,
      fontWeight: ds.fontWeight.medium,
    },
    divider: {
      marginVertical: ds.spacing.sm,
    },
    switchContainer: {
      width: ds.iconSize.md,
      alignItems: 'center',
    },
    absoluteTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    headerBlur: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    headerBase: {
      paddingLeft: ds.spacing.xl,
      paddingRight: ds.spacing.xl,
      paddingVertical: ds.spacing.md,
    },
    headerFallback: {
      backgroundColor: theme.background,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    headerTitle: {
      ...ds.typography.headline,
      fontWeight: ds.fontWeight.bold,
    },
    closeButtonContainer: {
      position: 'absolute',
      right: -(ds.spacing.xs + ds.spacing.xxs),
    },
  });
