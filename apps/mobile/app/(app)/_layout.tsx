import {Platform, View, useWindowDimensions} from 'react-native';
import {Stack, useSegments} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {GestureDetector} from 'react-native-gesture-handler';
import {HeaderButton} from '@/components/ui';
import {SideMenu} from '@/features/side-bar/side-menu';
import {SidebarBackdrop} from '@/features/side-bar/sidebar-backdrop';
import {SIDEBAR_CONFIG} from '@/constants/sidebar';
import {
  HeaderVisibilityProvider,
  SidebarProvider,
  useSidebar,
  useTheme,
} from '@/providers';
import {AppIcons} from '@/utils';

const HEADER_HEIGHT = {
  android: 80,
  ios: 100,
} as const;

function AppStack() {
  const {theme} = useTheme();
  const {toggleSideMenu, slideAnim, sideMenuOpen, closeSideMenu, mainGesture} =
    useSidebar();
  const segments = useSegments();
  const isModalOpen = segments.some((segment) => segment === '(modals)');
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const headerHeight =
    Platform.OS === 'android' ? HEADER_HEIGHT.android : HEADER_HEIGHT.ios;

  const mainContentStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, Platform.OS === 'ios' ? 0.15 : 0.2],
      Extrapolate.CLAMP,
    );

    const elevation = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, 8],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{translateX: slideAnim.value}],
      shadowOpacity,
      elevation,
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, 1],
      Extrapolate.CLAMP,
    );

    return {
      opacity,
    };
  });

  return (
    <View style={{flex: 1, backgroundColor: theme.background}}>
      {/* Sidebar - underneath everything */}
      <SideMenu slideAnim={slideAnim} onClose={closeSideMenu} />

      {/* Main content - animated sliding layer */}
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: theme.background,
            shadowColor: '#000',
            shadowOffset: {width: -3, height: 0},
            shadowRadius: 12,
          },
          mainContentStyle,
        ]}
      >
        {/* Left border that slides with content */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 0.5,
              backgroundColor: theme.divider,
              zIndex: 10000,
            },
            borderStyle,
          ]}
        />

        {/* Backdrop inside the sliding content */}
        <SidebarBackdrop slideAnim={slideAnim} />

        {/* Stack navigator */}
        <Stack
          screenOptions={{
            contentStyle: {backgroundColor: theme.background},
            headerShown: true,
            headerTransparent: Platform.OS === 'ios',
            headerStyle:
              Platform.OS === 'android'
                ? {backgroundColor: theme.navigationBar}
                : undefined,
            headerTitleStyle: {color: theme.text},
            headerTitleAlign: 'center',
            headerLeft: () => (
              <HeaderButton
                icon={AppIcons.navigation.menu}
                accessibilityLabel="Open menu"
                onPress={toggleSideMenu}
              />
            ),
          }}
        >
          <Stack.Screen name="(tabs)" options={{headerShown: true}} />
          <Stack.Screen
            name="(modals)"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </Animated.View>

      {/* Edge gesture detector for opening/closing sidebar */}
      {!isModalOpen && (
        <GestureDetector gesture={mainGesture}>
          <View
            style={{
              position: 'absolute',
              top: sideMenuOpen ? 0 : headerHeight,
              left: sideMenuOpen ? SIDEBAR_CONFIG.width : 0,
              width: sideMenuOpen
                ? screenWidth - SIDEBAR_CONFIG.width
                : SIDEBAR_CONFIG.gestureEdgeWidth,
              height: sideMenuOpen ? screenHeight : screenHeight - headerHeight,
              zIndex: 1001,
            }}
          />
        </GestureDetector>
      )}
    </View>
  );
}

export default function AppLayout() {
  return (
    <HeaderVisibilityProvider>
      <SidebarProvider>
        <AppStack />
      </SidebarProvider>
    </HeaderVisibilityProvider>
  );
}
