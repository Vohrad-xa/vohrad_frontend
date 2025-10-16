import {
  View,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router';
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  interpolate,
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

interface SideMenuProps {
  slideAnim: SharedValue<number>;
  onClose: () => void;
}

const menuItems: MenuItemType[] = [
  {icon: AppIcons.business.maintenance, label: 'Maintenances'},
  {icon: AppIcons.actions.move, label: 'Check In/Out'},
  {icon: AppIcons.inventory.items, label: 'Items'},
  {icon: AppIcons.inventory.locations, label: 'Locations'},
  {icon: AppIcons.content.document, label: 'Documents'},
  {icon: AppIcons.business.suppliers, label: 'Suppliers'},
  {icon: AppIcons.business.events, label: 'Events'},
  {icon: AppIcons.content.print, label: 'Labels'},
  {icon: AppIcons.inventory.categories, label: 'Categories'},
];

export function SideMenu({slideAnim, onClose}: SideMenuProps) {
  const {theme, ds} = useTheme();
  const {menuCloseGesture} = useSidebar();
  const insets = useSafeAreaInsets();
  const nativeGesture = Gesture.Native();
  const composedGesture = Gesture.Simultaneous(menuCloseGesture, nativeGesture);

  // Calculate heights needed for padding
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
  const headerBorderOpacity = useSharedValue(0);
  const footerBorderOpacity = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    borderBottomWidth: 1,
    borderBottomColor: interpolateColor(
      headerBorderOpacity.value,
      [0, 1],
      ['transparent', theme.border],
    ),
  }));

  const footerStyle = useAnimatedStyle(() => ({
    borderTopWidth: 1,
    borderTopColor: interpolateColor(
      footerBorderOpacity.value,
      [0, 1],
      ['transparent', theme.border],
    ),
  }));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const scrollY = contentOffset.y;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    const distanceFromBottom = maxScroll - scrollY;

    headerBorderOpacity.value = withTiming(scrollY > 10 ? 1 : 0, {
      duration: 200,
    });

    footerBorderOpacity.value = withTiming(distanceFromBottom > 10 ? 1 : 0, {
      duration: 200,
    });
  };

  const contentStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0.95, 1],
      'clamp',
    );

    const opacity = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width * 0.3, SIDEBAR_CONFIG.width],
      [0.3, 0.6, 1],
      'clamp',
    );

    return {
      transform: [{scale}],
      opacity,
    };
  });

  // Gradient shadow opacity
  const shadowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [1, 0],
      'clamp',
    );
    return {opacity};
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, contentStyle]}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator
            bounces
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                label={item.label}
                onPress={() => {
                  Keyboard.dismiss();
                  // TODO: Navigate to page when routes are ready
                }}
              />
            ))}
          </ScrollView>
          <View style={styles.absoluteTop}>
            <SideMenuHeader headerStyle={headerStyle} onClose={onClose} />
          </View>
          <Animated.View style={[styles.absoluteBottom, footerStyle]}>
            <ProfileSection
              onPressSettings={() => {
                Keyboard.dismiss();
                router.push('/(modals)/settings');
              }}
              onPressProfile={() => {
                Keyboard.dismiss();
                router.push('/(modals)/settings/profile');
              }}
            />
          </Animated.View>
        </Animated.View>

        {/* Premium edge shadow gradient */}
        <Animated.View
          pointerEvents="none"
          style={[styles.shadowContainer, shadowStyle]}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)', 'transparent']}
            start={{x: 1, y: 0}}
            end={{x: 0, y: 0}}
            style={styles.gradient}
          />
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
        zIndex: 0,
        backgroundColor: theme.sidebarBackground,
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
        right: 0.5,
        zIndex: 1,
      },
      absoluteBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0.5,
      },
      shadowContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 120,
        zIndex: 3,
      },
      gradient: {
        flex: 1,
      },
    }),
  (theme, ds, headerHeight, footerHeight) =>
    `${themeKey(theme, ds)}|${headerHeight}|${footerHeight}`,
);
