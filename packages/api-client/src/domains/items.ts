import {
  createPaginatedResponseSchema,
  emptyDataSchema,
  itemDetailSchema,
  itemSchema,
  type ApiResponse,
  type CursorDirection,
  type CursorOrder,
  type Item,
  type ItemCreate,
  type ItemDetail,
  type ItemLocationUpdate,
  type ItemUpdate,
  type PaginatedResponse,
} from '@sykamore/types';
import {httpClient} from '../core/client';
import {API_ENDPOINTS} from './endpoints';

const paginatedItemsSchema = createPaginatedResponseSchema(itemSchema);

export type ListItemsParams = {
  limit?: number;
  cursor?: string;
  direction?: CursorDirection;
  order?: CursorOrder;
  odataFilter?: string;
  count?: boolean;
};

export class ItemApi {
  async getItems(
    params: ListItemsParams = {},
  ): Promise<ApiResponse<PaginatedResponse<Item>>> {
    const search = new URLSearchParams();
    if (typeof params.limit === 'number') {
      search.set('limit', String(params.limit));
    }
    if (params.cursor) {
      search.set('cursor', params.cursor);
    }
    if (params.direction) {
      search.set('direction', params.direction);
    }
    if (params.order) {
      search.set('order', params.order);
    }
    if (params.odataFilter) {
      search.set('odata_filter', params.odataFilter);
    }
    if (typeof params.count === 'boolean') {
      search.set('odata_count', String(params.count));
    }

    const queryString = search.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ITEMS.LIST}?${queryString}`
      : API_ENDPOINTS.ITEMS.LIST;
    return httpClient.get(endpoint, paginatedItemsSchema);
  }

  async getItemById(id: string): Promise<ItemDetail> {
    const response = await httpClient.get(
      API_ENDPOINTS.ITEMS.DETAIL(id),
      itemDetailSchema,
    );
    return response.data;
  }

  async getItemBySku(sku: string): Promise<ItemDetail> {
    const response = await httpClient.get(
      API_ENDPOINTS.ITEMS.BY_SKU(sku),
      itemDetailSchema,
    );
    return response.data;
  }

  async createItem(data: ItemCreate): Promise<Item> {
    const response = await httpClient.post(
      API_ENDPOINTS.ITEMS.CREATE,
      itemSchema,
      data,
    );
    return response.data;
  }

  async updateItem(id: string, data: ItemUpdate): Promise<Item> {
    const response = await httpClient.patch(
      API_ENDPOINTS.ITEMS.UPDATE(id),
      itemSchema,
      data,
    );
    return response.data;
  }

  async deleteItem(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.ITEMS.DELETE(id), emptyDataSchema);
  }

  async updateItemLocationById(
    itemLocationId: string,
    data: ItemLocationUpdate,
  ): Promise<void> {
    await httpClient.patch(
      API_ENDPOINTS.ITEM_LOCATIONS.UPDATE(itemLocationId),
      emptyDataSchema,
      data,
    );
  }
}

export const itemApi = new ItemApi();
