import {apiClientEvents} from '@sykamore/api-client';
import {errorCenter} from './error-center';
import {requestTracker} from './request-tracker';

let connected = false;

export function ensureClientRuntimeConnected(): void {
  if (connected) {
    return;
  }

  connected = true;

  apiClientEvents.subscribeToRequestActivity((event) => {
    if (event.phase === 'started') {
      requestTracker.recordStarted(event.requestId);
      return;
    }

    requestTracker.recordFinished(event.requestId);
  });

  apiClientEvents.subscribeToErrors((event) => {
    errorCenter.report(event.error, {
      retryCallback: event.retry,
    });
  });
}
