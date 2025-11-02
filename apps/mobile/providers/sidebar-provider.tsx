import React, {createContext, useContext, useCallback, useEffect} from 'react';
import {Keyboard} from 'react-native';
import {
  Gesture,
  type PanGesture,
  type TapGesture,
} from 'react-native-gesture-handler';
import {
  useSharedValue,
  withTiming,
  useAnimatedReaction,
} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {SIDEBAR_CONFIG, SIDEBAR_ANIMATION} from '@/constants/sidebar';
import {getItem, setItem} from '@/utils/storage';
import type {SharedValue} from 'react-native-reanimated';

interface SidebarContextValue {
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

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
}

export function SidebarProvider({children}: SidebarProviderProps) {
  const slideAnim = useSharedValue(0);
  const wasOpen = useSharedValue(false);

  // Helper function to dismiss keyboard (must be regular function, not arrow)
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  // Load initial value
  useEffect(() => {
    const loadInitialValue = async () => {
      try {
        const saved = await getItem('sidebar-open');
        const value = saved === 'true' ? SIDEBAR_CONFIG.width : 0;
        slideAnim.value = value;
      } catch {
        // sidebar will default to closed
      }
    };
    loadInitialValue();
  }, [slideAnim]);

  // Save state to storage on change
  const saveSidebarState = async (isOpen: boolean) => {
    'worklet';
    try {
      await setItem('sidebar-open', isOpen.toString());
    } catch {}
  };

  useAnimatedReaction(
    () => slideAnim.value,
    (value, previous) => {
      'worklet';
      // Only save when changed
      if (value !== previous) {
        const isOpen = value > 0;
        saveSidebarState(isOpen);
      }
    },
  );

  const closeSidebarWorklet = useCallback(() => {
    'worklet';
    slideAnim.value = withTiming(0, SIDEBAR_ANIMATION.toggle);
    scheduleOnRN(dismissKeyboard);
  }, [slideAnim, dismissKeyboard]);

  const toggleSideMenu = useCallback(() => {
    'worklet';
    const isCurrentlyOpen = slideAnim.value > 0;
    const targetValue = isCurrentlyOpen ? 0 : SIDEBAR_CONFIG.width;
    slideAnim.value = withTiming(targetValue, SIDEBAR_ANIMATION.toggle);
  }, [slideAnim]);

  const closeSideMenu = useCallback(() => {
    closeSidebarWorklet();
  }, [closeSidebarWorklet]);

  const mainGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesDown((event, manager) => {
      'worklet';
      const touch = event.allTouches[0];
      wasOpen.value = slideAnim.value > 0;

      // Exclude header area
      const isInHeader = touch.y < 100;

      if (wasOpen.value) {
        if (!isInHeader) {
          manager.activate();
        } else {
          manager.fail();
        }
      } else {
        // only activate starting 30px from left edge
        if (touch.x < 30 && !isInHeader) {
          manager.activate();
        } else {
          manager.fail();
        }
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (wasOpen.value) {
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
      const threshold = SIDEBAR_CONFIG.width * SIDEBAR_CONFIG.openThreshold;
      const velocityThreshold = SIDEBAR_CONFIG.velocityThreshold;

      let targetValue = 0;

      if (wasOpen.value) {
        if (
          slideAnim.value > threshold &&
          event.velocityX > -velocityThreshold
        ) {
          targetValue = SIDEBAR_CONFIG.width;
        } else {
          targetValue = 0;
        }
      } else {
        if (
          slideAnim.value > threshold ||
          event.velocityX > velocityThreshold
        ) {
          targetValue = SIDEBAR_CONFIG.width;
        } else {
          targetValue = 0;
        }
      }

      slideAnim.value = withTiming(targetValue, SIDEBAR_ANIMATION.toggle);
    });

  // This gesture is for panning on the SideMenu component itself.
  const menuCloseGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .enabled(true)
    .onStart(() => {
      'worklet';
      wasOpen.value = slideAnim.value > 0;
    })
    .onUpdate((event) => {
      'worklet';
      const newX = SIDEBAR_CONFIG.width + event.translationX;
      if (newX <= SIDEBAR_CONFIG.width) {
        slideAnim.value = Math.max(0, newX);
      }
    })
    .onEnd(() => {
      'worklet';
      if (slideAnim.value < SIDEBAR_CONFIG.closeThreshold) {
        closeSidebarWorklet();
      } else {
        slideAnim.value = withTiming(
          SIDEBAR_CONFIG.width,
          SIDEBAR_ANIMATION.timing,
        );
      }
    });

  // This gesture is for tapping the backdrop to close the menu.
  const tapGesture = Gesture.Tap().onEnd(() => {
    'worklet';
    closeSidebarWorklet();
  });

  const value = {
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
