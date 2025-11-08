import type {
  Item,
  ItemDetail,
  ItemCreate,
  ItemUpdate,
  ItemLocationUpdate,
  ApiResponse,
  PaginatedResponse,
} from '@vohrad/types';
import {httpClient} from './http-client';
import {API_ENDPOINTS} from './endpoints';

export class ItemApi {
  async getItems(
    urlOrPage: string | number,
    size?: number,
    odataFilter?: string,
  ): Promise<ApiResponse<PaginatedResponse<Item>>> {
    // If it's a URL string, use it directly
    if (typeof urlOrPage === 'string') {
      return httpClient.get<PaginatedResponse<Item>>(urlOrPage);
    }

    // Otherwise, build the URL from page/size/filter
    const page = urlOrPage;
    const filterParam = odataFilter
      ? `&odata_filter=${encodeURIComponent(odataFilter)}`
      : '';
    return httpClient.get<PaginatedResponse<Item>>(
      `${API_ENDPOINTS.ITEMS.LIST}?page=${page}&size=${size}${filterParam}`,
    );
  }

  async searchItems(
    urlOrQuery: string,
    page?: number,
    size?: number,
  ): Promise<ApiResponse<PaginatedResponse<Item>>> {
    // If it's a URL string, use it directly
    if (urlOrQuery.startsWith('http') || urlOrQuery.startsWith('/items')) {
      return httpClient.get<PaginatedResponse<Item>>(urlOrQuery);
    }

    // Otherwise, build the URL from query/page/size
    const query = urlOrQuery;
    return httpClient.get<PaginatedResponse<Item>>(
      `${API_ENDPOINTS.ITEMS.SEARCH}?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
    );
  }

  async getActiveItems(
    urlOrPage: string | number,
    size?: number,
  ): Promise<ApiResponse<PaginatedResponse<Item>>> {
    // If it's a URL string, use it directly
    if (typeof urlOrPage === 'string') {
      return httpClient.get<PaginatedResponse<Item>>(urlOrPage);
    }

    // Otherwise, build the URL from page/size
    const page = urlOrPage;
    return httpClient.get<PaginatedResponse<Item>>(
      `${API_ENDPOINTS.ITEMS.ACTIVE}?page=${page}&size=${size}`,
    );
  }

  async getItemById(id: string): Promise<ItemDetail> {
    const response = await httpClient.get<ItemDetail>(
      `${API_ENDPOINTS.ITEMS.DETAIL(id)}`,
    );
    return response.data;
  }

  async getItemByCode(code: string): Promise<ItemDetail> {
    const response = await httpClient.get<ItemDetail>(
      `${API_ENDPOINTS.ITEMS.BY_CODE(code)}`,
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

  async updateItemLocation(
    itemId: string,
    locationId: string,
    data: ItemLocationUpdate,
  ): Promise<void> {
    await httpClient.put(
      API_ENDPOINTS.ITEMS.UPDATE_LOCATION(itemId, locationId),
      data,
    );
  }
}

export const itemApi = new ItemApi();
