import {useCallback, useMemo, useRef} from 'react';
import {useRouter, type Href, type Router} from 'expo-router';

type RouterMethods = Pick<Router, 'push' | 'navigate' | 'replace'>;
type NavOptions = Parameters<RouterMethods['push']>[1];

const NAVIGATION_DEBOUNCE_MS = 500;

let lastGlobalNavTime = 0;
let lastGlobalNavHref: string | null = null;

/**
 * Wrapper around expo-router's useRouter that debounces navigation
 * to prevent duplicate screens from rapid double-taps.
 *
 * Usage: Replace `import { useRouter } from 'expo-router' with
 * `import { useSafeRouter } from '@/utils/navigation'`
 */
export function useSafeRouter(): Router {
  const router = useRouter();
  const lastTapTime = useRef(0);

  const createDebouncedNav = useCallback(
    (navMethod: 'push' | 'navigate' | 'replace') =>
      (href: Href, options?: NavOptions) => {
        const now = Date.now();
        const hrefStr = typeof href === 'string' ? href : JSON.stringify(href);

        // Skip if same href tapped within debounce window
        if (
          now - lastTapTime.current < NAVIGATION_DEBOUNCE_MS &&
          lastGlobalNavHref === hrefStr
        ) {
          return;
        }

        // Global debounce across all uses of this hook
        if (
          now - lastGlobalNavTime < NAVIGATION_DEBOUNCE_MS &&
          lastGlobalNavHref === hrefStr
        ) {
          return;
        }

        lastTapTime.current = now;
        lastGlobalNavTime = now;
        lastGlobalNavHref = hrefStr;

        return router[navMethod](href, options);
      },
    [router],
  );

  return useMemo(
    () => ({
      ...router,
      push: createDebouncedNav('push'),
      navigate: createDebouncedNav('navigate'),
      replace: createDebouncedNav('replace'),
    }),
    [router, createDebouncedNav],
  );
}
