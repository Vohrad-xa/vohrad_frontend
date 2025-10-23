import {Platform, View, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import {SIDEBAR_CONFIG} from '@/constants/sidebar';
import {type ThemeShape} from '@/constants/theme';
import {SideMenu} from '@/features/side-bar/side-menu';
import {SidebarBackdrop} from '@/features/side-bar/sidebar-backdrop';
import {
  HeaderVisibilityProvider,
  SidebarProvider,
  useSidebar,
  useTheme,
} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

function AppStack() {
  const {theme} = useTheme();
  const {slideAnim, closeSideMenu, mainGesture} = useSidebar();

  const styles = createStyles(theme);

  const mainContentStyle = useAnimatedStyle(() => {
    // Color swap: main content gets sidebar background when open
    const backgroundColor = interpolateColor(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [theme.background, theme.sidebarBackground],
    );

    // On web: use margin to shrink content width (triggers CSS Grid reflow)
    if (Platform.OS === 'web') {
      return {
        marginLeft: slideAnim.value,
        backgroundColor,
      };
    }

    // Mobile: use transform (pushes content, hides overflow)
    const shadowOpacity = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, Platform.OS === 'ios' ? 0.05 : 0.05], // Much reduced shadow
      'clamp',
    );

    const elevation = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, 2], // Much reduced elevation
      'clamp',
    );

    return {
      transform: [{translateX: slideAnim.value}],
      shadowOpacity,
      elevation,
      backgroundColor,
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, 1],
      'clamp',
    );

    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <SideMenu slideAnim={slideAnim} onClose={closeSideMenu} />

      <GestureDetector gesture={mainGesture}>
        <Animated.View style={[styles.mainContent, mainContentStyle]}>
          <Animated.View style={[styles.border, borderStyle]} />

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

const createStyles = makeStyleFactory(
  (theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.sidebarBackground,
      },
      mainContent: {
        flex: 1,
        // Background color is now animated in mainContentStyle
        shadowColor: '#000000ab',
        shadowOffset: {width: 2, height: 0},
        shadowRadius: 10,
        // Removed borderRadius to prevent visual conflicts with sidebar scaling
      },
      border: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 0.5,
        backgroundColor: theme.lightdivider,
        zIndex: 10000,
        pointerEvents: 'none',
      },
    }),
  (theme) => theme.version.toString(),
);
