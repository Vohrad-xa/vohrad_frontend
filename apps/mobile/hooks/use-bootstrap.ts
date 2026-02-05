import {useEffect, useState} from 'react';
import {bootstrap} from '@/utils/bootstrap';

export function useBootstrap() {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initializeApp() {
      try {
        await bootstrap();
      } finally {
        if (!cancelled) setIsComplete(true);
      }
    }

    initializeApp();

    return () => {
      cancelled = true;
    };
  }, []);

  return isComplete;
}
