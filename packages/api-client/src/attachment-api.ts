import {httpClient} from './http-client';
import {API_ENDPOINTS} from './endpoints';
import {resolveAttachmentUrl} from './config';
import type {
  ItemAttachment,
  PaginatedResponse,
  AttachmentTargetType,
  AttachmentKind,
} from '@vohrad/types';

export type ListAttachmentsParams = {
  targetType?: AttachmentTargetType;
  targetId?: string;
  page?: number;
  size?: number;
  kind?: AttachmentKind;
  includeDeleted?: boolean;
};

export class AttachmentApi {
  async uploadAttachment(formData: FormData): Promise<ItemAttachment> {
    const response = await httpClient.postFormData<ItemAttachment>(
      API_ENDPOINTS.ATTACHMENTS.CREATE,
      formData,
    );
    return response.data;
  }

  async listAttachments(
    params: ListAttachmentsParams = {},
  ): Promise<PaginatedResponse<ItemAttachment>> {
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
    if (typeof params.page === 'number') {
      search.set('page', String(params.page));
    }
    if (typeof params.size === 'number') {
      search.set('size', String(params.size));
    }
    if (params.includeDeleted) {
      search.set('include_deleted', 'true');
    }

    const queryString = search.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ATTACHMENTS.LIST}?${queryString}`
      : API_ENDPOINTS.ATTACHMENTS.LIST;
    const response =
      await httpClient.get<PaginatedResponse<ItemAttachment>>(endpoint);
    return response.data;
  }

  async deleteAttachment(
    id: string,
    options?: {hardDelete?: boolean},
  ): Promise<void> {
    const endpoint = options?.hardDelete
      ? `${API_ENDPOINTS.ATTACHMENTS.DELETE(id)}?hard_delete=true`
      : API_ENDPOINTS.ATTACHMENTS.DELETE(id);
    await httpClient.delete(endpoint);
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
