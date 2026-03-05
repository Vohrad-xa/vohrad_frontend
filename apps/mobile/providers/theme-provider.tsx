import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Appearance,
  Easing,
  Platform,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import {ThemeProvider as NavigationThemeProvider} from '@react-navigation/native';
import {
  NavigationThemes,
  Tokens,
  createDesignSystem,
  type ColorScheme,
  type ThemePreference,
} from '@/constants';
import * as storage from '@/utils/storage';

type ThemeContextValue = {
  scheme: ColorScheme;
  preference: ThemePreference;
  setScheme: (preference: ThemePreference) => void;
  toggle: () => void;
  theme: typeof Tokens.light | typeof Tokens.dark;
  ds: ReturnType<typeof createDesignSystem>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Must be rendered inside `AppThemeProvider`.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within AppThemeProvider');
  return ctx;
}

const STORAGE_KEY = 'app.theme.scheme';

function normalizeScheme(v: unknown): ColorScheme | null {
  return v === 'light' || v === 'dark' ? v : null;
}

/**
 * Persists the last resolved system scheme on `globalThis` so it survives
 * Fast Refresh. RN's own Appearance cache gets poisoned with `'unspecified'`
 * after `setColorScheme('unspecified')`, making both `useColorScheme()` and
 * `Appearance.getColorScheme()` unreliable on remount.
 */
const _g = globalThis as Record<string, unknown>;
const _SCHEME_CACHE_KEY = '__sykamore_systemScheme';

function getLastKnownSystemScheme(): ColorScheme {
  const cached = _g[_SCHEME_CACHE_KEY];
  if (cached === 'light' || cached === 'dark') return cached;
  return normalizeScheme(Appearance.getColorScheme()) ?? 'light';
}

function cacheSystemScheme(scheme: ColorScheme) {
  _g[_SCHEME_CACHE_KEY] = scheme;
}

/**
 * Manages color-scheme preference (system / light / dark), persists it to
 * storage, and exposes resolved tokens + design-system metrics.
 *
 * - Wraps `@react-navigation/native` ThemeProvider.
 * - Renders nothing until persisted preference has been hydrated.
 * - Includes a cross-fade overlay for the manual `toggle()` transition.
 */
export function AppThemeProvider({children}: {children: React.ReactNode}) {
  const cs = useColorScheme();

  const [systemScheme, setSystemScheme] = useState<ColorScheme>(() => {
    const initial = getLastKnownSystemScheme();
    cacheSystemScheme(initial);
    return initial;
  });

  useEffect(() => {
    const next = normalizeScheme(cs);
    if (next) {
      setSystemScheme(next);
      cacheSystemScheme(next);
    }
  }, [cs]);

  const [preference, setPreference] = useState<ThemePreference>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = (await storage.getItem(
          STORAGE_KEY,
        )) as ThemePreference | null;
        if (
          mounted &&
          (saved === 'light' || saved === 'dark' || saved === 'system')
        ) {
          setPreference(saved);
        }
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storage.setItem(STORAGE_KEY, preference).catch((error) => {
      console.warn('Failed to save theme preference:', error);
    });
  }, [preference, hydrated]);

  // Guarded by `hydrated` to prevent premature native reset during Fast Refresh.
  useEffect(() => {
    if (Platform.OS === 'web' || !hydrated) return;
    Appearance.setColorScheme(
      preference === 'system' ? 'unspecified' : preference,
    );
  }, [preference, hydrated]);

  const scheme: ColorScheme =
    preference === 'system' ? systemScheme : preference;

  const {width, height, fontScale} = useWindowDimensions();

  const ds = useMemo(
    () => createDesignSystem(width, height, fontScale),
    [width, height, fontScale],
  );

  const theme = useMemo(() => Tokens[scheme], [scheme]);
  const navTheme = NavigationThemes[scheme];

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [overlayColor, setOverlayColor] = useState<string | null>(null);
  const isAnimating = useRef(false);

  const toggle = useCallback(() => {
    if (isAnimating.current) return;

    const nextPreference: ThemePreference =
      scheme === 'light' ? 'dark' : 'light';
    const currentBackground = Tokens[scheme].background;

    isAnimating.current = true;
    overlayOpacity.stopAnimation();
    overlayOpacity.setValue(1);
    setOverlayColor(currentBackground);
    setPreference(nextPreference);

    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
      setOverlayColor(null);
    });
  }, [overlayOpacity, scheme]);

  const value = useMemo(
    () => ({
      scheme,
      preference,
      setScheme: setPreference,
      toggle,
      theme,
      ds,
    }),
    [scheme, preference, toggle, theme, ds],
  );

  if (!hydrated) return null;

  return (
    <NavigationThemeProvider value={navTheme}>
      <ThemeContext.Provider value={value}>
        {children}
        {overlayColor ? (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
                pointerEvents: 'none',
              },
            ]}
          />
        ) : null}
      </ThemeContext.Provider>
    </NavigationThemeProvider>
  );
}
