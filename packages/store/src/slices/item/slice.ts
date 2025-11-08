import type {StateCreator} from 'zustand';
import type {Item, ItemDetail, ItemAttachment} from '@vohrad/types';
import type {AsyncState, PaginatedState} from '../../utils/state';

type UpdatePagePayload = PaginatedState & {
  items: Item[];
  strategy?: 'replace' | 'append';
};

export interface ItemSlice extends PaginatedState, AsyncState {
  items: Item[];
  selectedItem: ItemDetail | null;
  updatePage: (payload: UpdatePagePayload) => void;
  setSelectedItem: (item: ItemDetail | null) => void;
  addItem: (item: Item) => void;
  updateItemInList: (id: string, updates: Partial<Item>) => void;
  updateItemLocation: (locationId: string, quantity: number) => void;
  removeItem: (id: string) => void;
  upsertItemAttachment: (attachment: ItemAttachment) => void;
  removeItemAttachment: (attachmentId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null, retryCallback?: () => void) => void;
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
  links: null,
  isLoading: false,
  error: null,
  retryCallback: null,

  updatePage: ({
    items,
    strategy = 'replace',
    ...pagination
  }: UpdatePagePayload) =>
    set((state) => ({
      items:
        strategy === 'append' && state.items.length > 0
          ? [...state.items, ...items]
          : items,
      ...pagination,
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

  updateItemLocation: (locationId: string, quantity: number) =>
    set((state) => {
      const selected = state.selectedItem;
      if (!selected?.locations) {
        return state;
      }

      const updatedLocations = selected.locations.map((loc) =>
        loc.id === locationId ? {...loc, quantity} : loc,
      );

      const totalQuantity = updatedLocations.reduce((sum, loc) => {
        const value = Number(loc.quantity ?? 0);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0);

      return {
        selectedItem: {
          ...selected,
          locations: updatedLocations,
          total_quantity: totalQuantity,
        },
        items: state.items.map((item) =>
          item.id === selected.id
            ? {
                ...item,
                total_quantity: totalQuantity,
              }
            : item,
        ),
      };
    }),

  removeItem: (id: string) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      total: state.total - 1,
      selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
    })),

  upsertItemAttachment: (attachment: ItemAttachment) =>
    set((state) => {
      const selected = state.selectedItem;
      if (!selected) {
        return state;
      }

      const existingAttachments = selected.attachments ?? [];
      const index = existingAttachments.findIndex(
        (a) => a.id === attachment.id,
      );
      const updatedAttachments =
        index >= 0
          ? [
              ...existingAttachments.slice(0, index),
              attachment,
              ...existingAttachments.slice(index + 1),
            ]
          : [attachment, ...existingAttachments];

      return {
        selectedItem: {
          ...selected,
          attachments: updatedAttachments,
        },
      };
    }),

  removeItemAttachment: (attachmentId: string) =>
    set((state) => {
      const selected = state.selectedItem;
      if (!selected?.attachments) {
        return state;
      }

      return {
        selectedItem: {
          ...selected,
          attachments: selected.attachments.filter(
            (a) => a.id !== attachmentId,
          ),
        },
      };
    }),

  setLoading: (loading: boolean) => set({isLoading: loading}),

  setError: (error: string | null, retryCallback?: () => void) =>
    set({error, retryCallback: retryCallback ?? null}),

  clearError: () => set({error: null, retryCallback: null}),

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
      links: null,
      error: null,
    }),
});
