import React, {createContext, useContext, useState} from 'react';
import {Keyboard} from 'react-native';
import {Gesture, type PanGesture, type TapGesture} from 'react-native-gesture-handler';
import {useSharedValue, withSpring, runOnJS, withTiming} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import {useSegments, router} from 'expo-router';

interface SidebarContextValue {
  sideMenuOpen: boolean;
  slideAnim: SharedValue<number>;
  toggleSideMenu: () => void;
  closeSideMenu: () => void;
  mainGesture: PanGesture;
  menuCloseGesture: PanGesture;
  tapGesture: TapGesture;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}

export function SidebarProvider({children}: {children: React.ReactNode}) {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const slideAnim = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const startX = useSharedValue(0);
  const segments = useSegments();
  const isModalOpen = segments.some((segment) => segment === '(modals)');

  const toggleSideMenu = () => {
    const isOpening = !sideMenuOpen;
    setSideMenuOpen(isOpening);
    slideAnim.value = withSpring(isOpening ? 320 : 0, {damping: 20, stiffness: 200, mass: 0.8});
  };

  const closeSideMenu = () => {
    setSideMenuOpen(false);
    slideAnim.value = withSpring(0, {damping: 20, stiffness: 200, mass: 0.8});
    Keyboard.dismiss();
  };

  const closeModalIfOpen = () => {
    if (isModalOpen) {
      setTimeout(() => router.back(), 150);
    }
  };

  // This is the main gesture for the container view.
  // It handles both opening the menu from the edge and closing it from the main content area.
  const mainGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-50, 50])
    .simultaneousWithExternalGesture()
    .enabled(true)
    .onBegin((event) => {
      'worklet';
      if (sideMenuOpen || event.x < 50) {
        isDragging.value = true;
        runOnJS(closeModalIfOpen)();
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (!isDragging.value) return;

      if (sideMenuOpen) {
        const newX = Math.max(0, Math.min(320, 320 + event.translationX));
        slideAnim.value = newX;
      } else {
        const newX = Math.max(0, Math.min(320, event.translationX));
        slideAnim.value = newX;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (!isDragging.value) return;

      const threshold = 320 * 0.4;
      const velocityThreshold = 1000;

      let targetValue = 0;
      let shouldOpen = false;

      if (sideMenuOpen) {
        if (slideAnim.value > threshold && event.velocityX > -velocityThreshold) {
          targetValue = 320;
          shouldOpen = true;
        } else {
          targetValue = 0;
          shouldOpen = false;
        }
      } else {
        if (slideAnim.value > threshold || event.velocityX > velocityThreshold) {
          targetValue = 320;
          shouldOpen = true;
        } else {
          targetValue = 0;
          shouldOpen = false;
        }
      }

      slideAnim.value = withSpring(targetValue, {damping: 18, stiffness: 180, mass: 0.7, velocity: event.velocityX});
      runOnJS(setSideMenuOpen)(shouldOpen);
      isDragging.value = false;
    })
    .onFinalize(() => {
      'worklet';
      isDragging.value = false;
    });

  // This gesture is specifically for panning on the SideMenu component itself.
  const menuCloseGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .enabled(true)
    .onStart(() => {
      'worklet';
      startX.value = slideAnim.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newX = startX.value + event.translationX;
      if (newX <= 320) {
        slideAnim.value = Math.max(0, newX);
      }
    })
    .onEnd(() => {
      'worklet';
      if (slideAnim.value < 220) {
        runOnJS(closeSideMenu)();
      } else {
        slideAnim.value = withTiming(320, {duration: 150});
      }
    });

  // This gesture is for tapping the backdrop to close the menu.
  const tapGesture = Gesture.Tap()
    .enabled(true)
    .onEnd(() => {
      'worklet';
      runOnJS(closeModalIfOpen)();
      runOnJS(closeSideMenu)();
    });

  const value = {
    sideMenuOpen,
    slideAnim,
    toggleSideMenu,
    closeSideMenu,
    mainGesture,
    menuCloseGesture,
    tapGesture,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
