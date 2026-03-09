import {ApiError, type ApiErrorSource} from '@sykamore/types';

export type ErrorScope = 'global' | 'local';

export type ErrorCategory =
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'conflict'
  | 'not_found'
  | 'server'
  | 'network'
  | 'timeout'
  | 'unknown';

export interface ErrorInfo {
  category: ErrorCategory;
  title: string;
  isRetryable: boolean;
}

export interface AppError {
  id: string;
  message: string;
  category: ErrorCategory;
  title: string;
  isRetryable: boolean;
  timestamp: number;
  statusCode?: number;
  code?: string;
  correlationId?: string;
  source?: ApiErrorSource;
  retryCallback?: () => Promise<void> | void;
  scope: ErrorScope;
}

type ReportErrorOptions = {
  category?: ErrorCategory;
  title?: string;
  isRetryable?: boolean;
  scope?: ErrorScope;
  retryCallback?: () => Promise<void> | void;
};

type ErrorListener = (error: AppError) => void;

type ConfigOptions = {
  maxHistorySize?: number;
  enableLogging?: boolean;
};

class ErrorCenter {
  private readonly listeners = new Set<ErrorListener>();
  private history: AppError[] = [];
  private maxHistorySize = 50;
  private enableLogging = false;

  report(error: unknown, options?: ReportErrorOptions): AppError {
    const normalized = this.normalize(error, options);

    this.history.unshift(normalized);
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }

    if (this.enableLogging) {
      console.error(
        `[ErrorCenter] ${normalized.title}: ${normalized.message}`,
        {
          category: normalized.category,
          code: normalized.code,
          statusCode: normalized.statusCode,
          correlationId: normalized.correlationId,
        },
      );
    }

    this.listeners.forEach((listener) => listener(normalized));
    return normalized;
  }

  subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getHistory(limit?: number): AppError[] {
    return limit ? this.history.slice(0, limit) : [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  configure(options: ConfigOptions): void {
    if (typeof options.maxHistorySize === 'number') {
      this.maxHistorySize = Math.max(1, options.maxHistorySize);
    }
    if (typeof options.enableLogging === 'boolean') {
      this.enableLogging = options.enableLogging;
    }
  }

  private normalize(error: unknown, options?: ReportErrorOptions): AppError {
    const scope = options?.scope ?? 'global';

    if (error instanceof ApiError) {
      const info = this.categorizeApiError(error);
      return {
        id: this.createId(),
        message: error.detail,
        category: options?.category ?? info.category,
        title: options?.title ?? error.title ?? info.title,
        isRetryable: options?.isRetryable ?? info.isRetryable,
        timestamp: Date.now(),
        statusCode: error.status,
        code: error.code,
        correlationId: error.correlationId,
        source: error.source,
        retryCallback: options?.retryCallback,
        scope,
      };
    }

    const message =
      typeof error === 'string'
        ? error
        : error instanceof Error
          ? error.message
          : 'An unexpected error occurred.';

    const info = this.categorizeMessage(message);

    return {
      id: this.createId(),
      message,
      category: options?.category ?? info.category,
      title: options?.title ?? info.title,
      isRetryable: options?.isRetryable ?? info.isRetryable,
      timestamp: Date.now(),
      retryCallback: options?.retryCallback,
      scope,
    };
  }

  private categorizeApiError(error: ApiError): ErrorInfo {
    if (error.source === 'timeout') {
      return {
        category: 'timeout',
        title: 'Request Timeout',
        isRetryable: true,
      };
    }

    if (error.source === 'network' || error.status === 0) {
      return {
        category: 'network',
        title: 'Connection Error',
        isRetryable: true,
      };
    }

    if (
      error.status === 401 ||
      error.code.startsWith('TOKEN_') ||
      error.code.startsWith('OIDC_') ||
      error.code === 'AUTHENTICATION_FAILED'
    ) {
      return {
        category: 'authentication',
        title: error.title || 'Login Failed',
        isRetryable: false,
      };
    }

    if (error.status === 403) {
      return {
        category: 'authorization',
        title: error.title || 'Access Denied',
        isRetryable: false,
      };
    }

    if (error.status === 404) {
      return {
        category: 'not_found',
        title: error.title || 'Not Found',
        isRetryable: false,
      };
    }

    if (error.status === 409) {
      return {
        category: 'conflict',
        title: error.title || 'Conflict',
        isRetryable: false,
      };
    }

    if (
      error.status === 400 ||
      error.status === 422 ||
      error.code.includes('VALIDATION') ||
      error.code.includes('INVALID')
    ) {
      return {
        category: 'validation',
        title: error.title || 'Invalid Input',
        isRetryable: false,
      };
    }

    if (error.status >= 500) {
      return {
        category: 'server',
        title: error.title || 'Server Error',
        isRetryable: true,
      };
    }

    return {
      category: 'unknown',
      title: error.title || 'Error',
      isRetryable: false,
    };
  }

  private categorizeMessage(message: string): ErrorInfo {
    const lower = message.toLowerCase();

    if (lower.includes('timeout') || lower.includes('timed out')) {
      return {category: 'timeout', title: 'Request Timeout', isRetryable: true};
    }
    if (
      lower.includes('network') ||
      lower.includes('connection') ||
      lower.includes('offline') ||
      lower.includes('unable to connect')
    ) {
      return {
        category: 'network',
        title: 'Connection Error',
        isRetryable: true,
      };
    }
    if (lower.includes('unauthorized') || lower.includes('login')) {
      return {
        category: 'authentication',
        title: 'Login Failed',
        isRetryable: false,
      };
    }
    if (lower.includes('forbidden') || lower.includes('access denied')) {
      return {
        category: 'authorization',
        title: 'Access Denied',
        isRetryable: false,
      };
    }
    if (lower.includes('not found')) {
      return {category: 'not_found', title: 'Not Found', isRetryable: false};
    }
    if (lower.includes('invalid') || lower.includes('required')) {
      return {
        category: 'validation',
        title: 'Invalid Input',
        isRetryable: false,
      };
    }
    if (lower.includes('conflict')) {
      return {category: 'conflict', title: 'Conflict', isRetryable: false};
    }
    return {category: 'unknown', title: 'Error', isRetryable: false};
  }

  private createId(): string {
    return `err-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }
}

export const errorCenter = new ErrorCenter();
