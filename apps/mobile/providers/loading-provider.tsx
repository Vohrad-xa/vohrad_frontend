import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {loadingManager} from '@vohrad/api-client';
import {ErrorHandlerProvider} from './error-handler-provider';

type LoadingContextValue = {
  isLoading: boolean;
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

  useEffect(() => {
    return loadingManager.subscribe((state) => {
      setIsLoading(state.isVisible);
    });
  }, []);

  return (
    <ErrorHandlerProvider>
      <LoadingContext.Provider value={{isLoading}}>
        {children}
      </LoadingContext.Provider>
    </ErrorHandlerProvider>
  );
}
