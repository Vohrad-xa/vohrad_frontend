type ErrorListener = (error: AppError) => void;

export type ErrorScope = 'global' | 'local';

type ReportErrorOptions = {
  category?: ErrorCategory;
  title?: string;
  isRetryable?: boolean;
  scope?: ErrorScope;
};

export type ErrorCategory =
  | 'authentication'
  | 'authorization'
  | 'validation'
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
  retryCallback?: () => Promise<void> | void;
  scope: ErrorScope;
}

type ConfigOptions = {
  maxHistorySize?: number;
  enableLogging?: boolean;
};

/**
 * Classifies, records, and broadcasts API errors to subscribed UI components.
 *
 * - Errors are categorized by message pattern into authentication, network, validation, etc.
 * - History is capped at maxHistorySize (default 50) with newest errors first.
 */
class GlobalErrorManager {
  private listeners = new Set<ErrorListener>();
  private history: AppError[] = [];
  private maxHistorySize = 50;
  private enableLogging = false;

  /**
   * Creates, stores, and broadcasts a new AppError derived from message and HTTP status.
   *
   * - Category, title, and retryability are inferred from the message unless overridden via options.
   * - Returns the created AppError for inline handling at the call site.
   */
  reportError(
    message: string,
    statusCode?: number,
    retryCallback?: () => Promise<void> | void,
    options?: ReportErrorOptions,
  ): AppError {
    const info = this.categorize(message);
    const category = options?.category ?? info.category;
    const title = options?.title ?? info.title;
    const isRetryable = options?.isRetryable ?? info.isRetryable;
    const scope = options?.scope ?? 'global';

    const error: AppError = {
      id: `err-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      message,
      category,
      title,
      isRetryable,
      timestamp: Date.now(),
      statusCode,
      retryCallback,
      scope,
    };

    this.history.unshift(error);
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }

    if (this.enableLogging) {
      console.error(`[ErrorManager] ${error.title}: ${error.message}`, {
        category: error.category,
        statusCode: error.statusCode,
      });
    }

    this.listeners.forEach((listener) => listener(error));

    return error;
  }

  /**
   * Subscribes to errors as they are reported.
   *
   * - Returns an unsubscribe function — call it on unmount to prevent memory leaks.
   */
  subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Returns recorded errors in reverse-chronological order, optionally capped to limit.
   */
  getHistory(limit?: number): AppError[] {
    return limit ? this.history.slice(0, limit) : [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  /**
   * Overrides default settings for history size and console logging.
   */
  configure(options: ConfigOptions): void {
    if (typeof options.maxHistorySize === 'number')
      this.maxHistorySize = Math.max(1, options.maxHistorySize);
    if (typeof options.enableLogging === 'boolean')
      this.enableLogging = options.enableLogging;
  }

  /**
   * Infers category, display title, and retryability from a raw error message.
   *
   * - Matching is case-insensitive against known keywords and HTTP status codes.
   * - Falls back to category 'unknown' with isRetryable false if no pattern matches.
   */
  categorize(message: string): ErrorInfo {
    const lower = message.toLowerCase();

    if (this.isAuthenticationError(lower))
      return {
        category: 'authentication',
        title: 'Login Failed',
        isRetryable: false,
      };
    if (this.isAuthorizationError(lower))
      return {
        category: 'authorization',
        title: 'Access Denied',
        isRetryable: false,
      };
    if (this.isValidationError(lower))
      return {
        category: 'validation',
        title: 'Invalid Input',
        isRetryable: false,
      };
    if (this.isNotFoundError(lower))
      return {category: 'not_found', title: 'Not Found', isRetryable: false};
    if (this.isTimeoutError(lower))
      return {category: 'timeout', title: 'Request Timeout', isRetryable: true};
    if (this.isNetworkError(lower))
      return {
        category: 'network',
        title: 'Connection Error',
        isRetryable: true,
      };
    if (this.isServerError(lower))
      return {category: 'server', title: 'Server Error', isRetryable: true};

    return {category: 'unknown', title: 'Error', isRetryable: false};
  }

  getTitle(message: string): string {
    return this.categorize(message).title;
  }

  isRetryable(message: string): boolean {
    return this.categorize(message).isRetryable;
  }

  isAuthenticationError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('credential') ||
      lower.includes('password') ||
      lower.includes('invalid email') ||
      lower.includes('authentication') ||
      lower.includes('unauthorized') ||
      lower.includes('refresh token') ||
      lower.includes('session expired') ||
      lower.includes('401')
    );
  }

  isAuthorizationError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('forbidden') ||
      lower.includes('permission') ||
      lower.includes('access denied') ||
      lower.includes('403')
    );
  }

  isValidationError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('validation') ||
      lower.includes('invalid') ||
      lower.includes('required') ||
      lower.includes('must be') ||
      lower.includes('400')
    );
  }

  isNotFoundError(message: string): boolean {
    const lower = message.toLowerCase();
    return lower.includes('not found') || lower.includes('404');
  }

  isTimeoutError(message: string): boolean {
    const lower = message.toLowerCase();
    return lower.includes('timeout') || lower.includes('timed out');
  }

  isNetworkError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('network') ||
      lower.includes('connection') ||
      lower.includes('offline') ||
      lower.includes('unable to connect')
    );
  }

  isServerError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('server') ||
      lower.includes('500') ||
      lower.includes('502') ||
      lower.includes('503') ||
      lower.includes('504')
    );
  }
}

export const errorManager = new GlobalErrorManager();
