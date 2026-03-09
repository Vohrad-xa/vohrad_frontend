import {
  attachmentCountsSummarySchema,
  attachmentWithCountsSchema,
  createPaginatedResponseSchema,
  itemAttachmentSchema,
  textDataSchema,
  type ApiResponse,
  type AttachmentCounts,
  type AttachmentKind,
  type AttachmentTargetType,
  type AttachmentWithCounts,
  type CursorDirection,
  type CursorOrder,
  type ItemAttachment,
  type PaginatedResponse,
} from '@sykamore/types';
import {httpClient} from '../core/client';
import {API_ENDPOINTS} from './endpoints';
import {resolveAttachmentUrl} from '../core/url-resolver';

const paginatedAttachmentsSchema =
  createPaginatedResponseSchema(itemAttachmentSchema);

export type {AttachmentCounts, AttachmentWithCounts};

export type ListAttachmentsParams = {
  targetType?: AttachmentTargetType;
  targetId?: string;
  limit?: number;
  cursor?: string;
  direction?: CursorDirection;
  order?: CursorOrder;
  kind?: AttachmentKind;
  includeDeleted?: boolean;
  odataFilter?: string;
  odataOrderBy?: string;
  count?: boolean;
};

export class AttachmentApi {
  async uploadAttachment(formData: FormData): Promise<AttachmentWithCounts> {
    const response = await httpClient.postFormData(
      API_ENDPOINTS.ATTACHMENTS.CREATE,
      attachmentWithCountsSchema,
      formData,
    );
    return response.data;
  }

  async listAttachments(
    params: ListAttachmentsParams = {},
  ): Promise<ApiResponse<PaginatedResponse<ItemAttachment>>> {
    const search = new URLSearchParams();
    if (params.targetType) {
      search.set('target_type', params.targetType);
    }
    if (params.targetId) {
      search.set('target_id', params.targetId);
    }
    if (params.kind) {
      search.set('kind', params.kind);
    }
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
    if (params.includeDeleted) {
      search.set('include_deleted', 'true');
    }
    if (params.odataFilter) {
      search.set('odata_filter', params.odataFilter);
    }
    if (params.odataOrderBy) {
      search.set('odata_orderby', params.odataOrderBy);
    }
    if (typeof params.count === 'boolean') {
      search.set('odata_count', String(params.count));
    }

    const queryString = search.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ATTACHMENTS.LIST}?${queryString}`
      : API_ENDPOINTS.ATTACHMENTS.LIST;
    return httpClient.get(endpoint, paginatedAttachmentsSchema);
  }

  async deleteAttachment(
    id: string,
    options?: {hardDelete?: boolean},
  ): Promise<AttachmentCounts> {
    const endpoint = options?.hardDelete
      ? `${API_ENDPOINTS.ATTACHMENTS.DELETE(id)}?hard_delete=true`
      : API_ENDPOINTS.ATTACHMENTS.DELETE(id);
    const response = await httpClient.delete(
      endpoint,
      attachmentCountsSummarySchema,
    );
    return response.data;
  }

  async getAttachmentUrl(id: string): Promise<string> {
    const response = await httpClient.get(
      API_ENDPOINTS.ATTACHMENTS.GET_URL(id),
      textDataSchema,
      {reportErrors: false},
    );
    const url = response.data;

    if (url.startsWith('/')) {
      return resolveAttachmentUrl(url);
    }

    return url;
  }
}

export const attachmentApi = new AttachmentApi();
