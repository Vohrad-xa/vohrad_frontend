import type {StateCreator} from 'zustand';
import type {Item, ItemDetail} from '@vohrad/types';

export interface ItemSlice {
  items: Item[];
  selectedItem: ItemDetail | null;
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  error: string | null;
  updatePage: (payload: {
    items: Item[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    strategy?: 'replace' | 'append';
  }) => void;
  setSelectedItem: (item: ItemDetail | null) => void;
  addItem: (item: Item) => void;
  updateItemInList: (id: string, updates: Partial<Item>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearItems: () => void;
}

export const createItemSlice: StateCreator<ItemSlice> = (set) => ({
  items: [],
  selectedItem: null,
  total: 0,
  page: 1,
  size: 20,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
  isLoading: false,
  error: null,

  updatePage: ({
    items,
    total,
    page,
    size,
    totalPages,
    hasNext,
    hasPrevious,
    strategy = 'replace',
  }) =>
    set((state) => ({
      items:
        strategy === 'append' && state.items.length > 0
          ? [...state.items, ...items]
          : items,
      total,
      page,
      size,
      totalPages,
      hasNext,
      hasPrevious,
    })),

  setSelectedItem: (item: ItemDetail | null) => set({selectedItem: item}),

  addItem: (item: Item) =>
    set((state) => ({
      items: [item, ...state.items],
      total: state.total + 1,
    })),

  updateItemInList: (id: string, updates: Partial<Item>) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? {...item, ...updates} : item,
      ),
      selectedItem:
        state.selectedItem?.id === id
          ? {...state.selectedItem, ...updates}
          : state.selectedItem,
    })),

  removeItem: (id: string) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      total: state.total - 1,
      selectedItem:
        state.selectedItem?.id === id ? null : state.selectedItem,
    })),

  setLoading: (loading: boolean) => set({isLoading: loading}),

  setError: (error: string | null) => set({error}),

  clearError: () => set({error: null}),

  clearItems: () =>
    set({
      items: [],
      selectedItem: null,
      total: 0,
      page: 1,
      size: 20,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
      error: null,
    }),
});
