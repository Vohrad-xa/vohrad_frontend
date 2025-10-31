import type {ReactNode} from 'react';
import React, {createContext, useContext, useState, useEffect} from 'react';
import type {MenuCard} from '@/types';
import {AppIcons} from '@/utils';
import * as AppStorage from '@/utils/storage';

const allCards: MenuCard[] = [
  {
    title: 'Items',
    icon: AppIcons.inventory.items,
    count: 245,
    colorToken: 'accentBlue',
  },
  {
    title: 'Locations',
    icon: AppIcons.inventory.locations,
    count: 8,
    colorToken: 'accentYellow',
  },
  {
    title: 'Maintenance',
    icon: AppIcons.business.maintenance,
    count: 12,
    colorToken: 'accentOrange',
  },
  {
    title: 'Suppliers',
    icon: AppIcons.business.suppliers,
    count: 18,
    colorToken: 'accentGreen',
  },
  {
    title: 'Check In/Out',
    icon: AppIcons.actions.move,
    count: 3,
    colorToken: 'destructive',
  },
  {
    title: 'Documents',
    icon: AppIcons.content.document,
    count: 156,
    colorToken: 'accentIndigo',
  },
];

export type CardVisibilityState = {
  items: boolean;
  locations: boolean;
  maintenance: boolean;
  suppliers: boolean;
  checkInOut: boolean;
  documents: boolean;
};

const STORAGE_KEY = 'card-visibility';

const defaultVisibility: CardVisibilityState = {
  items: true,
  locations: true,
  maintenance: true,
  suppliers: true,
  checkInOut: true,
  documents: true,
};

type FilterContextType = {
  visibility: CardVisibilityState;
  setCardVisibility: (card: keyof CardVisibilityState, value: boolean) => void;
  resetVisibility: () => void;
  getFilteredCards: () => MenuCard[];
  filteredCards: MenuCard[];
  allCards: MenuCard[];
};

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({children}: {children: ReactNode}) {
  const [visibility, setVisibility] =
    useState<CardVisibilityState>(defaultVisibility);

  const setCardVisibility = (
    card: keyof CardVisibilityState,
    value: boolean,
  ) => {
    setVisibility((prev) => ({
      ...prev,
      [card]: value,
    }));
  };

  const resetVisibility = () => {
    setVisibility(defaultVisibility);
  };

  const getFilteredCards = (): MenuCard[] => {
    const filtered = allCards.filter((card) => {
      switch (card.title) {
        case 'Items':
          return visibility.items;
        case 'Locations':
          return visibility.locations;
        case 'Maintenance':
          return visibility.maintenance;
        case 'Suppliers':
          return visibility.suppliers;
        case 'Check In/Out':
          return visibility.checkInOut;
        case 'Documents':
          return visibility.documents;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredCards = getFilteredCards();

  // Save visibility to storage whenever it changes
  useEffect(() => {
    const saveVisibility = async () => {
      try {
        await AppStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
      } catch (error) {
        console.error('Failed to save card visibility:', error);
      }
    };
    saveVisibility();
  }, [visibility]);

  const contextValue: FilterContextType = {
    visibility,
    setCardVisibility,
    resetVisibility,
    getFilteredCards,
    filteredCards,
    allCards,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
}
