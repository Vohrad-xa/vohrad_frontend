import type {ApiProblemDetails} from './schemas';

export type ApiErrorSource =
  | 'problem'
  | 'network'
  | 'timeout'
  | 'invalid_response'
  | 'unknown';

type ApiErrorInit = {
  status: number;
  code: string;
  title: string;
  detail?: string;
  type?: string;
  instance?: string;
  correlationId?: string;
  details?: unknown;
  source?: ApiErrorSource;
  cause?: unknown;
};

const DEFAULT_PROBLEM_TYPE = 'about:blank';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly title: string;
  readonly detail: string;
  readonly type: string;
  readonly instance?: string;
  readonly correlationId?: string;
  readonly details?: unknown;
  readonly source: ApiErrorSource;

  constructor(init: ApiErrorInit) {
    super(init.detail ?? init.title);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.title = init.title;
    this.detail = init.detail ?? init.title;
    this.type = init.type ?? DEFAULT_PROBLEM_TYPE;
    this.instance = init.instance;
    this.correlationId = init.correlationId;
    this.details = init.details;
    this.source = init.source ?? 'unknown';

    if (init.cause !== undefined) {
      Object.defineProperty(this, 'cause', {
        value: init.cause,
        enumerable: false,
        configurable: true,
      });
    }
  }

  static fromProblem(problem: ApiProblemDetails): ApiError {
    return new ApiError({
      status: problem.status,
      code: problem.code,
      title: problem.title,
      detail: problem.detail,
      type: problem.type,
      instance: problem.instance,
      correlationId: problem.correlation_id,
      details: problem.details,
      source: 'problem',
    });
  }

  static network(message = 'Unable to connect to the server', cause?: unknown) {
    return new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      title: 'Connection Error',
      detail: message,
      source: 'network',
      cause,
    });
  }

  static timeout(message = 'The request timed out', cause?: unknown) {
    return new ApiError({
      status: 0,
      code: 'REQUEST_TIMEOUT',
      title: 'Request Timeout',
      detail: message,
      source: 'timeout',
      cause,
    });
  }

  static invalidResponse(status: number, detail?: string, cause?: unknown) {
    return new ApiError({
      status,
      code: 'INVALID_RESPONSE',
      title: 'Invalid Server Response',
      detail:
        detail ?? 'The server returned a response in an unexpected format.',
      source: 'invalid_response',
      cause,
    });
  }

  static unknown(message = 'An unexpected error occurred', cause?: unknown) {
    return new ApiError({
      status: 0,
      code: 'UNKNOWN_ERROR',
      title: 'Unexpected Error',
      detail: message,
      source: 'unknown',
      cause,
    });
  }
}
