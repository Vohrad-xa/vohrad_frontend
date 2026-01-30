import * as React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

export const queryClient =
  globalThis.__SYKAMORE_QUERY_CLIENT__ ??
  (globalThis.__SYKAMORE_QUERY_CLIENT__ = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
      },
    },
  }));

export function QueryProvider({children}: {children: React.ReactNode}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
