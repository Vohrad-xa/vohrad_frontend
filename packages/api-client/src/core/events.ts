import type {ApiError} from '@sykamore/types';

export type ApiClientErrorEvent = {
  error: ApiError;
  retry?: () => Promise<void>;
};

export type RequestActivityEvent = {
  requestId: string;
  phase: 'started' | 'finished';
};

type ErrorListener = (event: ApiClientErrorEvent) => void;
type RequestActivityListener = (event: RequestActivityEvent) => void;

class ApiClientEvents {
  private readonly errorListeners = new Set<ErrorListener>();
  private readonly requestActivityListeners =
    new Set<RequestActivityListener>();

  emitError(event: ApiClientErrorEvent): void {
    this.errorListeners.forEach((listener) => listener(event));
  }

  emitRequestActivity(event: RequestActivityEvent): void {
    this.requestActivityListeners.forEach((listener) => listener(event));
  }

  subscribeToErrors(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  subscribeToRequestActivity(listener: RequestActivityListener): () => void {
    this.requestActivityListeners.add(listener);
    return () => this.requestActivityListeners.delete(listener);
  }
}

export const apiClientEvents = new ApiClientEvents();
