import {httpClient} from './http-client';
import {API_ENDPOINTS} from './endpoints';
import {resolveAttachmentUrl} from './config';

export class AttachmentApi {
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
