import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {loadingManager} from '@vohrad/api-client';
import {ErrorHandlerProvider} from './error-handler-provider';
import {useNetworkConnectivity} from './network-provider';

type LoadingContextValue = {
  isLoading: boolean;
  forceLoading: boolean;
};

const LoadingContext = createContext<LoadingContextValue | undefined>(
  undefined,
);

export function useLoading(): LoadingContextValue {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}

type LoadingProviderProps = {
  children: ReactNode;
};

export function LoadingProvider({children}: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorForceLoading, setErrorForceLoading] = useState(false);
  const {isOffline} = useNetworkConnectivity();
  const networkForceLoading = isOffline;
  const forceLoading = errorForceLoading || networkForceLoading;

  useEffect(() => {
    return loadingManager.subscribe((state) => {
      setIsLoading(state.isVisible);
    });
  }, []);

  return (
    <ErrorHandlerProvider onNetworkError={setErrorForceLoading}>
      <LoadingContext.Provider value={{isLoading, forceLoading}}>
        {children}
      </LoadingContext.Provider>
    </ErrorHandlerProvider>
  );
}
