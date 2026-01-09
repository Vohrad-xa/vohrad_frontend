import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type SearchContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchEnabled: boolean;
  setSearchEnabled: (enabled: boolean) => void;
};

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({children}: {children: ReactNode}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchEnabled, setSearchEnabled] = useState(true);

  const contextValue = useMemo<SearchContextType>(
    () => ({
      searchQuery,
      setSearchQuery,
      isSearchEnabled,
      setSearchEnabled,
    }),
    [searchQuery, isSearchEnabled],
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
