import React, {createContext, useContext, useCallback, useEffect} from 'react';
import {
  setHapticsEnabled,
  triggerHaptic as triggerHapticUtil,
  loadHapticsPreference,
  persistHapticsPreference,
  type HapticType,
} from '@/utils/haptics';

type HapticContextType = {
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  triggerHaptic: (type?: HapticType) => void;
};

const HapticContext = createContext<HapticContextType | undefined>(undefined);

type HapticProviderProps = {
  children: React.ReactNode;
  initialEnabled?: boolean;
};

export function HapticProvider({
  children,
  initialEnabled = true,
}: HapticProviderProps) {
  const [isEnabled, setIsEnabled] = React.useState(initialEnabled);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const stored = await loadHapticsPreference();
      if (!isMounted || stored == null) {
        return;
      }
      setIsEnabled(stored);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with utility module
  useEffect(() => {
    setHapticsEnabled(isEnabled);
  }, [isEnabled]);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    setHapticsEnabled(enabled);
    void persistHapticsPreference(enabled);
  }, []);

  const triggerHaptic = useCallback(
    (type: HapticType = 'light') => {
      if (!isEnabled) {
        return;
      }
      triggerHapticUtil(type);
    },
    [isEnabled],
  );

  return (
    <HapticContext.Provider value={{isEnabled, setEnabled, triggerHaptic}}>
      {children}
    </HapticContext.Provider>
  );
}

export function useHaptic(): HapticContextType {
  const context = useContext(HapticContext);
  if (!context) {
    throw new Error('useHaptic must be used within HapticProvider');
  }
  return context;
}
