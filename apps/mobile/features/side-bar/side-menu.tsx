import React, {useMemo} from 'react';
import {
  View,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import {router} from 'expo-router';
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {SIDEBAR_CONFIG} from '@/constants/sidebar';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useSidebar, useTheme} from '@/providers';
import type {MenuItem as MenuItemType} from '@/types/ui';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {MenuItem} from './menu-item';
import {ProfileSection} from './profile-section';
import {SideMenuHeader} from './side-menu-header';
import type {SharedValue} from 'react-native-reanimated';

type SideMenuProps = {
  slideAnim: SharedValue<number>;
  onClose: () => void;
};

const menuItems: MenuItemType[] = [
  {icon: AppIcons.tabs.home, label: 'Home'},
  {icon: AppIcons.features.maintenance, label: 'Maintenances'},
  {icon: AppIcons.actions.move, label: 'Check In/Out'},
  {icon: AppIcons.features.item, label: 'Items'},
  {icon: AppIcons.features.location, label: 'Locations'},
  {icon: AppIcons.files.document, label: 'Documents'},
  {icon: AppIcons.features.supplier, label: 'Suppliers'},
  {icon: AppIcons.tabs.notifications, label: 'Events'},
  {icon: AppIcons.files.print, label: 'Labels'},
  {icon: AppIcons.features.category, label: 'Categories'},
];

const ROUTE_BY_LABEL: Partial<Record<string, string>> = {
  Home: '/(app)/(tabs)/dashboard',
  Items: '/(app)/(tabs)/items',
  Events: '/(app)/(tabs)/settings',
};

export function SideMenu({slideAnim, onClose}: SideMenuProps) {
  const {theme, ds} = useTheme();
  const {menuCloseGesture} = useSidebar();
  const insets = useSafeAreaInsets();

  const gesture = useMemo(() => {
    // allow scrollview + close-pan together
    return Gesture.Simultaneous(menuCloseGesture, Gesture.Native());
  }, [menuCloseGesture]);

  const headerHeight =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) +
        ds.spacing.xl +
        ds.spacing.md * 2 +
        ds.components.searchBar.height
      : Math.max(insets.top, ds.spacing.xl) +
        ds.spacing.md * 2 +
        ds.components.searchBar.height;

  const footerHeight =
    ds.spacing.xl +
    ds.spacing.xs +
    ds.iconSize.xl +
    (Platform.OS === 'android' ? ds.spacing.xxxl : ds.spacing.lg);

  const styles = createStyles(theme, ds, headerHeight, footerHeight);
  const headerBlurIntensity = useSharedValue(0);
  const footerBlurIntensity = useSharedValue(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const scrollY = contentOffset.y;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    const distanceFromBottom = maxScroll - scrollY;

    headerBlurIntensity.value = withTiming(scrollY > 10 ? 40 : 0, {
      duration: 200,
    });
    footerBlurIntensity.value = withTiming(distanceFromBottom > 10 ? 40 : 0, {
      duration: 200,
    });
  };

  const containerStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      Platform.OS === 'web'
        ? [theme.sidebarBackground, theme.sidebarBackground]
        : [theme.sidebarBackground, theme.background],
    );

    return {backgroundColor: bg};
  }, [theme.sidebarBackground, theme.background]);

  const contentStyle = useAnimatedStyle(() => {
    const t = slideAnim.value;
    return {
      opacity: interpolate(
        t,
        [0, SIDEBAR_CONFIG.width * 0.3, SIDEBAR_CONFIG.width],
        [0.3, 0.6, 1],
        'clamp',
      ),
      transform: [
        {
          scale: interpolate(t, [0, SIDEBAR_CONFIG.width], [0.95, 1], 'clamp'),
        },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, contentStyle]}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator
            bounces
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                onPress={() => {
                  Keyboard.dismiss();

                  const path = ROUTE_BY_LABEL[item.label];
                  if (path) router.navigate(path as any);

                  onClose();
                }}
              />
            ))}
          </ScrollView>

          <View style={styles.absoluteTop}>
            <SideMenuHeader
              onClose={onClose}
              blurIntensity={headerBlurIntensity}
            />
          </View>

          <View style={styles.absoluteBottom}>
            <ProfileSection
              blurIntensity={footerBlurIntensity}
              onPressSettings={() => {
                Keyboard.dismiss();
                router.push('/(app)/(tabs)/settings');
                onClose();
              }}
              onPressProfile={() => {
                Keyboard.dismiss();
                router.push('/(app)/(tabs)/settings/profile');
                onClose();
              }}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const createStyles = makeStyleFactory(
  (
    theme: ThemeShape,
    ds: DSShape,
    headerHeight: number,
    footerHeight: number,
  ) =>
    StyleSheet.create({
      container: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: SIDEBAR_CONFIG.width,
        overflow: 'hidden',
      },
      scrollContainer: {
        flex: 1,
      },
      scrollContentContainer: {
        paddingHorizontal: ds.spacing.xl,
        paddingTop: headerHeight,
        paddingBottom: footerHeight + ds.spacing.md,
      },
      absoluteTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
      },
      absoluteBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      },
    }),
  (theme, ds, headerHeight, footerHeight) =>
    `${themeKey(theme, ds)}|${headerHeight}|${footerHeight}`,
);
