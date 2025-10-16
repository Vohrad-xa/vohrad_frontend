import {Platform, View} from 'react-native';
import {Stack} from 'expo-router';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {GestureDetector} from 'react-native-gesture-handler';
import {SideMenu} from '@/features/side-bar/side-menu';
import {SidebarBackdrop} from '@/features/side-bar/sidebar-backdrop';
import {SIDEBAR_CONFIG} from '@/constants/sidebar';
import {
  HeaderVisibilityProvider,
  SidebarProvider,
  useSidebar,
  useTheme,
} from '@/providers';

function AppStack() {
  const {theme} = useTheme();
  const {slideAnim, closeSideMenu, mainGesture} = useSidebar();

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
      <SideMenu slideAnim={slideAnim} onClose={closeSideMenu} />

      <GestureDetector gesture={mainGesture}>
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

          <SidebarBackdrop slideAnim={slideAnim} />

          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
          </Stack>
        </Animated.View>
      </GestureDetector>
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
