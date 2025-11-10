import type {StateCreator} from 'zustand';
import type {Item, ItemDetail, ItemAttachment} from '@vohrad/types';
import type {PaginationLinks} from '@vohrad/types';

type UpdatePagePayload = {
  items: Item[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  links: PaginationLinks | null;
  strategy?: 'replace' | 'append';
};

export interface ItemSlice {
  // Item-specific properties
  items: Item[];
  selectedItem: ItemDetail | null;

  // Namespaced pagination properties to avoid collision with AttachmentSlice
  itemsTotal: number;
  itemsPage: number;
  itemsSize: number;
  itemsTotalPages: number;
  itemsHasNext: boolean;
  itemsHasPrevious: boolean;
  itemsLinks: PaginationLinks | null;

  // Namespaced async properties
  itemsIsLoading: boolean;
  itemsError: string | null;
  itemsRetryCallback: (() => void) | null;

  // Actions
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
  itemsTotal: 0,
  itemsPage: 1,
  itemsSize: 20,
  itemsTotalPages: 0,
  itemsHasNext: false,
  itemsHasPrevious: false,
  itemsLinks: null,
  itemsIsLoading: false,
  itemsError: null,
  itemsRetryCallback: null,

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
      itemsTotal: state.itemsTotal + 1,
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
      itemsTotal: state.itemsTotal - 1,
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

  setLoading: (loading: boolean) => set({itemsIsLoading: loading}),

  setError: (error: string | null, retryCallback?: () => void) =>
    set({itemsError: error, itemsRetryCallback: retryCallback ?? null}),

  clearError: () => set({itemsError: null, itemsRetryCallback: null}),

  clearItems: () =>
    set({
      items: [],
      selectedItem: null,
      itemsTotal: 0,
      itemsPage: 1,
      itemsSize: 20,
      itemsTotalPages: 0,
      itemsHasNext: false,
      itemsHasPrevious: false,
      itemsLinks: null,
      itemsError: null,
    }),
});
