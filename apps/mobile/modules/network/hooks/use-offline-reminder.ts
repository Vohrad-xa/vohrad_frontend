import {useCallback, useRef, useState} from 'react';

export function useOfflineReminderEmitter() {
  const [offlineReminderSignal, setOfflineReminderSignal] = useState(0);
  const lastOfflineStateRef = useRef<boolean | null>(null);

  const triggerOfflineReminder = useCallback(() => {
    setOfflineReminderSignal((prev) => prev + 1);
  }, []);

  const notifyOfflineState = useCallback(
    (isOffline: boolean) => {
      const wasOffline = lastOfflineStateRef.current;
      lastOfflineStateRef.current = isOffline;

      if (isOffline && !wasOffline) {
        triggerOfflineReminder();
      }
    },
    [triggerOfflineReminder],
  );

  return {
    offlineReminderSignal,
    triggerOfflineReminder,
    notifyOfflineState,
  };
}
