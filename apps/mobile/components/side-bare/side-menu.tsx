import {
  View,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import {Gesture, GestureDetector, ScrollView} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue, withTiming, interpolateColor} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Tokens} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {useSidebar, useTheme} from '@/providers';
import type {MenuItem as MenuItemType} from '@/types/ui';
import {router} from 'expo-router';
import {AppIcons} from '@/utils';
import {MenuItem} from './MenuItem';
import {ProfileSection} from './ProfileSection';
import {SideMenuHeader} from './SideMenuHeader';
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
      ? (StatusBar.currentHeight ?? 0) + ds.spacing.xl + ds.spacing.md * 2 + ds.components.searchBar.height
      : Math.max(insets.top, ds.spacing.xl) + ds.spacing.md * 2 + ds.components.searchBar.height;

  const footerHeight =
    ds.spacing.xl + ds.spacing.xs + ds.iconSize.xl + (Platform.OS === 'android' ? ds.spacing.xxxl : ds.spacing.lg);

  const styles = createStyles(theme, ds, headerHeight, footerHeight);
  const headerBorderOpacity = useSharedValue(0);

  const sideMenuStyle = useAnimatedStyle(() => ({
    transform: [{translateX: slideAnim.value - 320}],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    borderBottomWidth: 1,
    borderBottomColor: interpolateColor(headerBorderOpacity.value, [0, 1], ['transparent', theme.border]),
  }));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    headerBorderOpacity.value = withTiming(scrollY > 10 ? 1 : 0, {
      duration: 200,
    });
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, sideMenuStyle]}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator
          bounces
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              onPress={() => {
                onClose();
                Keyboard.dismiss();
              }}
            />
          ))}
        </ScrollView>
        <View style={styles.absoluteTop}>
          <SideMenuHeader headerStyle={headerStyle} onClose={onClose} />
        </View>
        <View style={styles.absoluteBottom}>
          <ProfileSection
            onPressSettings={() => {
              Keyboard.dismiss();
              router.push('/(modals)/settings');
            }}
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const createStyles = (
  theme: typeof Tokens.light | typeof Tokens.dark,
  ds: typeof DesignSystem,
  headerHeight: number,
  footerHeight: number,
) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 320,
      zIndex: 1000,
      backgroundColor: theme.sidebarBackground,
      borderRightWidth: 1,
      borderRightColor: theme.border,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingHorizontal: ds.spacing.xl,
      paddingTop: headerHeight + ds.spacing.md,
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
  });
