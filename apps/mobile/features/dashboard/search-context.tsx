import type {ReactNode} from 'react';
import React, {createContext, useContext, useState} from 'react';

type SearchContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({children}: {children: ReactNode}) {
  const [searchQuery, setSearchQuery] = useState('');

  const contextValue: SearchContextType = {
    searchQuery,
    setSearchQuery,
  };

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
