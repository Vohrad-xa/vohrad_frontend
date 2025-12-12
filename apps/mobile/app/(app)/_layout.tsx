import {Platform, View, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, interpolate} from 'react-native-reanimated';
import {ThemedStatusBar} from '@/components/ui';
import {SIDEBAR_CONFIG} from '@/constants/sidebar';
import {type ThemeShape} from '@/constants/theme';
import {SideMenu, SidebarBackdrop} from '@/features/side-bar';
import {
  HeaderVisibilityProvider,
  SidebarProvider,
  useSidebar,
  useTheme,
} from '@/providers';
import {makeStyleFactory} from '@/utils';

function AppStack() {
  const {theme} = useTheme();
  const {slideAnim, closeSideMenu, mainGesture} = useSidebar();

  const styles = createStyles(theme);

  const mainContentStyle = useAnimatedStyle(() => {
    // On web we use margin to shrink content width (triggers CSS Grid reflow)
    if (Platform.OS === 'web') {
      return {
        marginLeft: slideAnim.value,
      };
    }

    // Mobile we use transform (pushes content, hides overflow)
    const shadowOpacity = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, Platform.OS === 'ios' ? 0.05 : 0.05],
      'clamp',
    );

    const elevation = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, 2],
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

      {Platform.OS === 'web' ? (
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
      ) : (
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
      )}
    </View>
  );
}

export default function AppLayout() {
  return (
    <HeaderVisibilityProvider>
      <SidebarProvider>
        <ThemedStatusBar />
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
      },
      mainContent: {
        flex: 1,
      },
      border: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.lightdivider,
        zIndex: 10000,
        pointerEvents: 'none',
      },
    }),
  (theme) => theme.version.toString(),
);
