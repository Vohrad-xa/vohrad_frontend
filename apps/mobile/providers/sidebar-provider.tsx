import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {Keyboard} from 'react-native';
import {useSegments} from 'expo-router';
import {
  Gesture,
  type PanGesture,
  type TapGesture,
} from 'react-native-gesture-handler';
import {
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import type {SharedValue} from 'react-native-reanimated';
import {SIDEBAR_CONFIG, SIDEBAR_ANIMATION} from '@/constants/sidebar';

interface SidebarContextValue {
  sideMenuOpen: boolean;
  slideAnim: SharedValue<number>;
  toggleSideMenu: () => void;
  closeSideMenu: () => void;
  mainGesture: PanGesture;
  menuCloseGesture: PanGesture;
  tapGesture: TapGesture;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined,
);

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
    slideAnim.value = withTiming(
      isOpening ? SIDEBAR_CONFIG.width : 0,
      SIDEBAR_ANIMATION.toggle,
    );
  };

  const closeSideMenu = useCallback(() => {
    setSideMenuOpen(false);
    slideAnim.value = withTiming(0, SIDEBAR_ANIMATION.toggle);
    Keyboard.dismiss();
  }, [slideAnim]);

  // Auto-close sidebar when modal opens
  useEffect(() => {
    if (isModalOpen && sideMenuOpen) {
      closeSideMenu();
    }
  }, [isModalOpen, sideMenuOpen, closeSideMenu]);

  // This is the main gesture for the container view.
  // It handles both opening the menu from the edge and closing it from the main content area.
  const mainGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-50, 50])
    .simultaneousWithExternalGesture()
    .enabled(!isModalOpen)
    .onBegin((event) => {
      'worklet';
      if (sideMenuOpen || event.x < SIDEBAR_CONFIG.gestureEdgeWidth) {
        isDragging.value = true;
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (!isDragging.value) return;

      if (sideMenuOpen) {
        const newX = Math.max(
          0,
          Math.min(
            SIDEBAR_CONFIG.width,
            SIDEBAR_CONFIG.width + event.translationX,
          ),
        );
        slideAnim.value = newX;
      } else {
        const newX = Math.max(
          0,
          Math.min(SIDEBAR_CONFIG.width, event.translationX),
        );
        slideAnim.value = newX;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (!isDragging.value) return;

      const threshold = SIDEBAR_CONFIG.width * SIDEBAR_CONFIG.openThreshold;
      const velocityThreshold = SIDEBAR_CONFIG.velocityThreshold;

      let targetValue = 0;
      let shouldOpen = false;

      if (sideMenuOpen) {
        if (
          slideAnim.value > threshold &&
          event.velocityX > -velocityThreshold
        ) {
          targetValue = SIDEBAR_CONFIG.width;
          shouldOpen = true;
        } else {
          targetValue = 0;
          shouldOpen = false;
        }
      } else {
        if (
          slideAnim.value > threshold ||
          event.velocityX > velocityThreshold
        ) {
          targetValue = SIDEBAR_CONFIG.width;
          shouldOpen = true;
        } else {
          targetValue = 0;
          shouldOpen = false;
        }
      }

      slideAnim.value = withTiming(targetValue, SIDEBAR_ANIMATION.toggle);
      scheduleOnRN(setSideMenuOpen, shouldOpen);
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
      if (newX <= SIDEBAR_CONFIG.width) {
        slideAnim.value = Math.max(0, newX);
      }
    })
    .onEnd(() => {
      'worklet';
      if (slideAnim.value < SIDEBAR_CONFIG.closeThreshold) {
        scheduleOnRN(closeSideMenu);
      } else {
        slideAnim.value = withTiming(
          SIDEBAR_CONFIG.width,
          SIDEBAR_ANIMATION.timing,
        );
      }
    });

  // This gesture is for tapping the backdrop to close the menu.
  const tapGesture = Gesture.Tap()
    .enabled(!isModalOpen)
    .onEnd(() => {
      'worklet';
      scheduleOnRN(closeSideMenu);
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

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
