import type {
  Location,
  ApiResponse,
  PaginatedResponse,
  CursorDirection,
  CursorOrder,
} from '@sykamore/types';
import {httpClient} from '../http-client';
import {API_ENDPOINTS} from './endpoints';

export type ListLocationsParams = {
  limit?: number;
  cursor?: string;
  direction?: CursorDirection;
  order?: CursorOrder;
  odataFilter?: string;
  count?: boolean;
};

export class LocationApi {
  async getLocations(
    params: ListLocationsParams = {},
  ): Promise<ApiResponse<PaginatedResponse<Location>>> {
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
      ? `${API_ENDPOINTS.LOCATIONS.LIST}?${queryString}`
      : API_ENDPOINTS.LOCATIONS.LIST;
    return httpClient.get<PaginatedResponse<Location>>(endpoint);
  }
}

export const locationApi = new LocationApi();
