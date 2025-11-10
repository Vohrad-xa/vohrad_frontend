import type {ItemSlice} from './slice';

export const itemSelectors = {
  // Item data
  items: (state: ItemSlice) => state.items,
  selectedItem: (state: ItemSlice) => state.selectedItem,

  // Namespaced pagination
  total: (state: ItemSlice) => state.itemsTotal,
  page: (state: ItemSlice) => state.itemsPage,
  size: (state: ItemSlice) => state.itemsSize,
  totalPages: (state: ItemSlice) => state.itemsTotalPages,
  hasNext: (state: ItemSlice) => state.itemsHasNext,
  hasPrevious: (state: ItemSlice) => state.itemsHasPrevious,
  links: (state: ItemSlice) => state.itemsLinks,

  // Namespaced async state
  isLoading: (state: ItemSlice) => state.itemsIsLoading,
  error: (state: ItemSlice) => state.itemsError,
  retryCallback: (state: ItemSlice) => state.itemsRetryCallback,

  // Actions
  updatePage: (state: ItemSlice) => state.updatePage,
  setSelectedItem: (state: ItemSlice) => state.setSelectedItem,
  addItem: (state: ItemSlice) => state.addItem,
  updateItemInList: (state: ItemSlice) => state.updateItemInList,
  updateItemLocation: (state: ItemSlice) => state.updateItemLocation,
  removeItem: (state: ItemSlice) => state.removeItem,
  upsertItemAttachment: (state: ItemSlice) => state.upsertItemAttachment,
  removeItemAttachment: (state: ItemSlice) => state.removeItemAttachment,
  setLoading: (state: ItemSlice) => state.setLoading,
  setError: (state: ItemSlice) => state.setError,
  clearError: (state: ItemSlice) => state.clearError,
  clearItems: (state: ItemSlice) => state.clearItems,
};
