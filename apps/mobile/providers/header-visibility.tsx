import React, {createContext, useContext, useMemo, useState} from 'react';

type HeaderVisibilityContextValue = {
  scrolled: boolean;
  setScrolled: (v: boolean) => void;
};

const HeaderVisibilityContext = createContext<
  HeaderVisibilityContextValue | undefined
>(undefined);

interface HeaderVisibilityProviderProps {
  children: React.ReactNode;
}

export function HeaderVisibilityProvider({
  children,
}: HeaderVisibilityProviderProps) {
  const [scrolled, setScrolled] = useState(false);
  const value = useMemo(() => ({scrolled, setScrolled}), [scrolled]);
  return (
    <HeaderVisibilityContext.Provider value={value}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
}

export function useHeaderVisibility(): HeaderVisibilityContextValue {
  const ctx = useContext(HeaderVisibilityContext);
  if (!ctx) {
    throw new Error(
      'useHeaderVisibility must be used within HeaderVisibilityProvider',
    );
  }
  return ctx;
}
