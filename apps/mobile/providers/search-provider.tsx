import type {ReactNode} from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const DEBOUNCE_MS = 400;
const MIN_SEARCH_LENGTH = 2;

type SearchContextType = {
  /** Raw input values (update immediately). */
  rawSearchQueries: Record<string, string>;
  /** Debounced values (update after 400ms, empty if < 2 chars). */
  debouncedSearchQueries: Record<string, string>;
  setSearchQuery: (scope: string, query: string) => void;
};

const SearchContext = createContext<SearchContextType | null>(null);
const DEFAULT_SEARCH_SCOPE = 'default';

export function SearchProvider({children}: {children: ReactNode}) {
  const [rawSearchQueries, setRawSearchQueries] = useState<
    Record<string, string>
  >({});
  const [debouncedSearchQueries, setDebouncedSearchQueries] = useState<
    Record<string, string>
  >({});
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const setSearchQuery = useCallback((scope: string, query: string) => {
    // Update raw immediately
    setRawSearchQueries((prev) => {
      if (prev[scope] === query) return prev;
      return {...prev, [scope]: query};
    });

    // Clear previous timer for this scope
    if (timersRef.current[scope]) {
      clearTimeout(timersRef.current[scope]);
      delete timersRef.current[scope];
    }

    // Clear search instantly
    if (query.trim().length < MIN_SEARCH_LENGTH) {
      setDebouncedSearchQueries((prev) => {
        if (prev[scope] === '') return prev;
        return {...prev, [scope]: ''};
      });
      return;
    }

    // Debounce the update to consumers
    timersRef.current[scope] = setTimeout(() => {
      setDebouncedSearchQueries((prev) => {
        if (prev[scope] === query) return prev;
        return {...prev, [scope]: query};
      });
      delete timersRef.current[scope];
    }, DEBOUNCE_MS);
  }, []);

  const contextValue = useMemo<SearchContextType>(
    () => ({
      rawSearchQueries,
      debouncedSearchQueries,
      setSearchQuery,
    }),
    [rawSearchQueries, debouncedSearchQueries, setSearchQuery],
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

  const searchQuery = context.debouncedSearchQueries[scope] ?? '';
  const rawSearchQuery = context.rawSearchQueries[scope] ?? '';

  const setSearchQuery = useCallback(
    (query: string) => {
      context.setSearchQuery(scope, query);
    },
    [context, scope],
  );

  return {
    /** Debounced search query (400ms delay, empty if < 2 chars). Use for data fetching. */
    searchQuery,
    /** Raw input value. Use if you need the immediate typing state. */
    rawSearchQuery,
    setSearchQuery,
  };
}
