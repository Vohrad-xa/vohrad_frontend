import {Platform, View, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, interpolate} from 'react-native-reanimated';
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
    // On web: use margin to shrink content width (triggers CSS Grid reflow)
    if (Platform.OS === 'web') {
      return {
        marginLeft: slideAnim.value,
      };
    }

    // Mobile: use transform (pushes content, hides overflow)
    const shadowOpacity = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, Platform.OS === 'ios' ? 0.15 : 0.2],
      'clamp',
    );

    const elevation = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, 8],
      'clamp',
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
        backgroundColor: theme.background,
        shadowColor: '#000000ab',
        shadowOffset: {width: 2, height: 0},
        shadowRadius: 10,
        ...(Platform.OS !== 'web' && {
          borderRadius: 40,
          overflow: 'hidden',
        }),
      },
      border: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        ...(Platform.OS !== 'web' && {
          borderRadius: 40,
        }),
        borderWidth: 0.5,
        borderColor: theme.lightdivider,
        zIndex: 10000,
        pointerEvents: 'none',
      },
    }),
  (theme) => theme.version.toString(),
);
