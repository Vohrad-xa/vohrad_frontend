import type {ReactNode} from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type SearchContextType = {
  searchQueries: Record<string, string>;
  setSearchQuery: (scope: string, query: string) => void;
};

const SearchContext = createContext<SearchContextType | null>(null);
const DEFAULT_SEARCH_SCOPE = 'default';

export function SearchProvider({children}: {children: ReactNode}) {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
    {},
  );

  const setSearchQuery = useCallback((scope: string, query: string) => {
    setSearchQueries((prev) => {
      if (prev[scope] === query) {
        return prev;
      }
      return {
        ...prev,
        [scope]: query,
      };
    });
  }, []);

  const contextValue = useMemo<SearchContextType>(
    () => ({
      searchQueries,
      setSearchQuery,
    }),
    [searchQueries, setSearchQuery],
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(scopeKey?: string) {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  const scope =
    scopeKey && scopeKey.trim().length > 0 ? scopeKey : DEFAULT_SEARCH_SCOPE;
  const searchQuery = context.searchQueries[scope] ?? '';
  const setSearchQuery = useCallback(
    (query: string) => {
      context.setSearchQuery(scope, query);
    },
    [context, scope],
  );
  return {
    searchQuery,
    setSearchQuery,
  };
}
