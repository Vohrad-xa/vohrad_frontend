import React from 'react';
import {View, Dimensions, Platform} from 'react-native';
import {useSegments} from 'expo-router';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {useSidebar, useTheme} from '@/providers';
import {SideMenu} from './side-menu';
import {SidebarBackdrop} from './sidebar-backdrop';

interface SidebarContainerProps {
  children: React.ReactNode;
}

export function SidebarContainer({children}: SidebarContainerProps) {
  const {theme} = useTheme();
  const {sideMenuOpen, slideAnim, closeSideMenu, mainGesture} = useSidebar();
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const headerHeight = Platform.OS === 'android' ? 80 : 100;
  const segments = useSegments();
  const isModalOpen = segments.some((segment) => segment === '(modals)');

  const mainContentStyle = useAnimatedStyle(() => {
    // For web not translating main content when modal is open
    if (Platform.OS === 'web' && isModalOpen) {
      return {
        transform: [{translateX: 0}, {scale: 1}],
      };
    }
    return {
      transform: [{translateX: slideAnim.value}, {scale: 1 - (slideAnim.value / 320) * 0}],
    };
  });

  return (
    <View style={{flex: 1, backgroundColor: theme.background, overflow: 'hidden'}}>
      <Animated.View style={[{flex: 1, backgroundColor: theme.background}, mainContentStyle]}>{children}</Animated.View>

      {/* This detector handles gestures on the main content area (or edge) */}
      <GestureDetector gesture={mainGesture}>
        <View
          style={{
            position: 'absolute',
            top: sideMenuOpen ? 0 : headerHeight,
            left: sideMenuOpen ? 320 : 0,
            width: sideMenuOpen ? `${100 - (320 / screenWidth) * 100}%` : 50,
            height: sideMenuOpen ? screenHeight : screenHeight - headerHeight,
            zIndex: sideMenuOpen ? 1001 : 1,
          }}
        />
      </GestureDetector>

      <SidebarBackdrop slideAnim={slideAnim} />
      <SideMenu slideAnim={slideAnim} onClose={closeSideMenu} />
    </View>
  );
}
