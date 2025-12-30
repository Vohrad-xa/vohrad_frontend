import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {Keyboard} from 'react-native';
import {
  Gesture,
  type PanGesture,
  type TapGesture,
} from 'react-native-gesture-handler';
import {
  useSharedValue,
  withTiming,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {SIDEBAR_CONFIG, SIDEBAR_ANIMATION} from '@/constants/sidebar';
import {getItem, setItem} from '@/utils/storage';

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
  edgeGestureEnabled?: boolean;

  /**
   * Height in px from the top of the screen where the edge-pan should NOT activate
   * (e.g., to avoid fighting with the header).
   * If not provided, defaults to safe-area top + 56.
   */
  headerExclusionHeight?: number;
}

const STORAGE_KEY = 'sidebar-open';

export function SidebarProvider({
  children,
  edgeGestureEnabled = true,
  headerExclusionHeight,
}: SidebarProviderProps) {
  const insets = useSafeAreaInsets();

  const slideAnim = useSharedValue(0);
  const wasOpen = useSharedValue(false);
  const edgeSwipeEnabled = useSharedValue(edgeGestureEnabled);

  const headerBlockHeight =
    headerExclusionHeight ?? Math.max(0, insets.top + 56);

  // Load initial value
  useEffect(() => {
    let mounted = true;

    const loadInitialValue = async () => {
      try {
        const saved = await getItem(STORAGE_KEY);
        const value = saved === 'true' ? SIDEBAR_CONFIG.width : 0;
        if (mounted) {
          slideAnim.value = value;
        }
      } catch {
        // default to closed
      }
    };

    void loadInitialValue();

    return () => {
      mounted = false;
    };
  }, [slideAnim]);

  useEffect(() => {
    edgeSwipeEnabled.value = edgeGestureEnabled;
  }, [edgeGestureEnabled, edgeSwipeEnabled]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const saveSidebarState = useCallback(async (isOpen: boolean) => {
    try {
      await setItem(STORAGE_KEY, isOpen.toString());
    } catch {}
  }, []);

  const persistSidebarState = useCallback(
    (isOpen: boolean) => {
      'worklet';
      runOnJS(saveSidebarState)(isOpen);
    },
    [saveSidebarState],
  );

  const closeSidebarWorklet = useCallback(() => {
    'worklet';
    slideAnim.value = withTiming(0, SIDEBAR_ANIMATION.toggle, (finished) => {
      'worklet';
      if (finished) {
        persistSidebarState(false);
      }
    });
    runOnJS(dismissKeyboard)();
  }, [slideAnim, persistSidebarState, dismissKeyboard]);

  const toggleSideMenu = useCallback(() => {
    'worklet';
    const isCurrentlyOpen = slideAnim.value > 0;
    const targetValue = isCurrentlyOpen ? 0 : SIDEBAR_CONFIG.width;

    slideAnim.value = withTiming(
      targetValue,
      SIDEBAR_ANIMATION.toggle,
      (finished) => {
        'worklet';
        if (finished) {
          persistSidebarState(targetValue > 0);
        }
      },
    );
  }, [slideAnim, persistSidebarState]);

  const closeSideMenu = useCallback(() => {
    closeSidebarWorklet();
  }, [closeSidebarWorklet]);

  const mainGesture = useMemo(() => {
    return Gesture.Pan()
      .manualActivation(true)
      .onTouchesDown((event, manager) => {
        'worklet';
        const touch = event.allTouches[0];
        wasOpen.value = slideAnim.value > 0;

        // Exclude header area (dynamic)
        const isInHeader = touch.y < headerBlockHeight;

        if (wasOpen.value) {
          if (!isInHeader) {
            manager.activate();
          } else {
            manager.fail();
          }
          return;
        }

        // closed: only activate from left edge if enabled
        if (!edgeSwipeEnabled.value) {
          manager.fail();
          return;
        }

        if (touch.x < SIDEBAR_CONFIG.gestureEdgeWidth && !isInHeader) {
          manager.activate();
        } else {
          manager.fail();
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

        slideAnim.value = withTiming(
          targetValue,
          SIDEBAR_ANIMATION.toggle,
          (finished) => {
            'worklet';
            if (finished) {
              persistSidebarState(targetValue > 0);
            }
          },
        );
      });
  }, [
    headerBlockHeight,
    edgeSwipeEnabled,
    slideAnim,
    wasOpen,
    persistSidebarState,
  ]);

  const menuCloseGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetX([-10, 10])
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
            (finished) => {
              'worklet';
              if (finished) {
                persistSidebarState(true);
              }
            },
          );
        }
      });
  }, [slideAnim, wasOpen, closeSidebarWorklet, persistSidebarState]);

  const tapGesture = useMemo(() => {
    return Gesture.Tap().onEnd(() => {
      'worklet';
      closeSidebarWorklet();
    });
  }, [closeSidebarWorklet]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      slideAnim,
      toggleSideMenu,
      closeSideMenu,
      mainGesture,
      menuCloseGesture,
      tapGesture,
    }),
    [
      slideAnim,
      toggleSideMenu,
      closeSideMenu,
      mainGesture,
      menuCloseGesture,
      tapGesture,
    ],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
