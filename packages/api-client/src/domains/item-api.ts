import type {
  Item,
  ItemDetail,
  ItemCreate,
  ItemUpdate,
  ItemLocationUpdate,
  ApiResponse,
  PaginatedResponse,
  CursorDirection,
  CursorOrder,
} from '@sykamore/types';
import {httpClient} from '../http-client';
import {API_ENDPOINTS} from './endpoints';

export type ListItemsParams = {
  limit?: number;
  cursor?: string;
  direction?: CursorDirection;
  order?: CursorOrder;
  odataFilter?: string;
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

    const queryString = search.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ITEMS.LIST}?${queryString}`
      : API_ENDPOINTS.ITEMS.LIST;
    return httpClient.get<PaginatedResponse<Item>>(endpoint);
  }

  async getItemById(id: string): Promise<ItemDetail> {
    const response = await httpClient.get<ItemDetail>(
      `${API_ENDPOINTS.ITEMS.DETAIL(id)}`,
    );
    return response.data;
  }

  async getItemBySku(sku: string): Promise<ItemDetail> {
    const response = await httpClient.get<ItemDetail>(
      `${API_ENDPOINTS.ITEMS.BY_SKU(sku)}`,
    );
    return response.data;
  }

  async createItem(data: ItemCreate): Promise<Item> {
    const response = await httpClient.post<Item>(
      API_ENDPOINTS.ITEMS.CREATE,
      data,
    );
    return response.data;
  }

  async updateItem(id: string, data: ItemUpdate): Promise<Item> {
    const response = await httpClient.put<Item>(
      API_ENDPOINTS.ITEMS.UPDATE(id),
      data,
    );
    return response.data;
  }

  async deleteItem(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.ITEMS.DELETE(id));
  }

  async updateItemLocationById(
    itemLocationId: string,
    data: ItemLocationUpdate,
  ): Promise<void> {
    await httpClient.put(
      API_ENDPOINTS.ITEM_LOCATIONS.UPDATE(itemLocationId),
      data,
    );
  }
}

export const itemApi = new ItemApi();
