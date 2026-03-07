import type {
  Item,
  ItemCreate,
  ItemDetail,
  ItemFilterState,
  ItemLocationUpdate,
  ItemUpdate,
  ListItemsParams,
} from '../schemas';

export type ItemQueryContract = {
  listParams?: ListItemsParams;
  filters?: ItemFilterState;
};

export interface ItemApiContract {
  getItems: (params?: ListItemsParams) => Promise<Item[]>;
  getItemById: (id: string) => Promise<ItemDetail>;
  createItem: (data: ItemCreate) => Promise<Item>;
  updateItem: (id: string, data: ItemUpdate) => Promise<Item>;
  updateItemLocationById: (
    itemLocationId: string,
    data: ItemLocationUpdate,
  ) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}
