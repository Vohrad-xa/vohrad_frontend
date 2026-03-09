import {
  createPaginatedResponseSchema,
  unitOfMeasureSchema,
  type ApiResponse,
  type CursorDirection,
  type CursorOrder,
  type PaginatedResponse,
  type UnitOfMeasure,
} from '@sykamore/types';
import {httpClient} from '../core/client';
import {API_ENDPOINTS} from './endpoints';

const paginatedUnitsSchema = createPaginatedResponseSchema(unitOfMeasureSchema);

export type ListUomParams = {
  limit?: number;
  cursor?: string;
  direction?: CursorDirection;
  order?: CursorOrder;
  odataFilter?: string;
  count?: boolean;
};

export class UomApi {
  async getUnits(
    params: ListUomParams = {},
  ): Promise<ApiResponse<PaginatedResponse<UnitOfMeasure>>> {
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
      ? `${API_ENDPOINTS.UOM.LIST}?${queryString}`
      : API_ENDPOINTS.UOM.LIST;
    return httpClient.get(endpoint, paginatedUnitsSchema);
  }
}

export const uomApi = new UomApi();
