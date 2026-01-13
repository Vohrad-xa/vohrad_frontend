import {httpClient} from '../http-client';
import {API_ENDPOINTS} from './endpoints';
import {resolveAttachmentUrl} from '../config';
import type {
  ItemAttachment,
  PaginatedResponse,
  AttachmentTargetType,
  AttachmentKind,
  ApiResponse,
  CursorDirection,
  CursorOrder,
} from '@sykamore/types';

export type AttachmentCounts = {
  attachments_total: number;
  attachment_counts: {
    image: number;
    document: number;
    video: number;
    archive: number;
    other: number;
  };
};

export type AttachmentWithCounts = {
  attachment: ItemAttachment;
  counts: AttachmentCounts;
};

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
};

export class AttachmentApi {
  async uploadAttachment(formData: FormData): Promise<AttachmentWithCounts> {
    const response = await httpClient.postFormData<AttachmentWithCounts>(
      API_ENDPOINTS.ATTACHMENTS.CREATE,
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
      search.set('$filter', params.odataFilter);
    }
    if (params.odataOrderBy) {
      search.set('$orderby', params.odataOrderBy);
    }

    const queryString = search.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ATTACHMENTS.LIST}?${queryString}`
      : API_ENDPOINTS.ATTACHMENTS.LIST;
    return httpClient.get<PaginatedResponse<ItemAttachment>>(endpoint);
  }

  async deleteAttachment(
    id: string,
    options?: {hardDelete?: boolean},
  ): Promise<AttachmentCounts> {
    const endpoint = options?.hardDelete
      ? `${API_ENDPOINTS.ATTACHMENTS.DELETE(id)}?hard_delete=true`
      : API_ENDPOINTS.ATTACHMENTS.DELETE(id);
    const response = await httpClient.delete<AttachmentCounts>(endpoint);
    return response.data;
  }

  async getAttachmentUrl(id: string): Promise<string> {
    const response = await httpClient.get<string>(
      API_ENDPOINTS.ATTACHMENTS.GET_URL(id),
    );
    const url = response.data;

    // If the API returns a relative path (local storage),
    // use resolveAttachmentUrl to handle tenant subdomain for IP addresses
    if (url.startsWith('/')) {
      return resolveAttachmentUrl(url);
    }

    // If it's already a full URL (S3 presigned), return as-is
    return url;
  }
}

export const attachmentApi = new AttachmentApi();
