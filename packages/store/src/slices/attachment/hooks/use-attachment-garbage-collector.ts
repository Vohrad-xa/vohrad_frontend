import {useEffect} from 'react';
import {useAuthStore} from '../../../store';

/**
 * Hook to manage the attachment garbage collector lifecycle.
 * Automatically starts the GC timer on mount and cleans it up on unmount.
 *
 * Usage: Call this hook once at the app root level (e.g., in App.tsx or a provider)
 *
 * @example
 * function App() {
 *   useAttachmentGarbageCollector();
 *   return <YourApp />;
 * }
 */
export function useAttachmentGarbageCollector() {
  const startGarbageCollector = useAuthStore(
    (state) => state.startGarbageCollector,
  );
  const stopGarbageCollector = useAuthStore(
    (state) => state.stopGarbageCollector,
  );

  useEffect(() => {
    // Start GC on mount
    startGarbageCollector();

    // Cleanup on unmount
    return () => {
      stopGarbageCollector();
    };
  }, [startGarbageCollector, stopGarbageCollector]);
}
