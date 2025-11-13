type ErrorListener = (error: AppError) => void;

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
}

type ConfigOptions = {
  maxHistorySize?: number;
  enableLogging?: boolean;
};

class GlobalErrorManager {
  private listeners = new Set<ErrorListener>();
  private history: AppError[] = [];
  private maxHistorySize = 50;
  private enableLogging = false;

  // Report a new error
  reportError(
    message: string,
    statusCode?: number,
    retryCallback?: () => Promise<void> | void,
  ): AppError {
    const info = this.categorize(message);
    const error: AppError = {
      id: `err-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      message,
      category: info.category,
      title: info.title,
      isRetryable: info.isRetryable,
      timestamp: Date.now(),
      statusCode,
      retryCallback,
    };

    // Add to history
    this.history.unshift(error);
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }

    // Log if enabled
    if (this.enableLogging) {
      console.error(`[ErrorManager] ${error.title}: ${error.message}`, {
        category: error.category,
        statusCode: error.statusCode,
      });
    }

    // Notify all subscribers
    this.listeners.forEach((listener) => {
      listener(error);
    });

    return error;
  }

  // subscribe to error events
  subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Get error history
  getHistory(limit?: number): AppError[] {
    return limit ? this.history.slice(0, limit) : [...this.history];
  }

  // Clear error history
  clearHistory(): void {
    this.history = [];
  }

  // Configure error manager settings
  configure(options: ConfigOptions): void {
    if (typeof options.maxHistorySize === 'number') {
      this.maxHistorySize = Math.max(1, options.maxHistorySize);
    }
    if (typeof options.enableLogging === 'boolean') {
      this.enableLogging = options.enableLogging;
    }
  }

  // Categorizes an error message and returns appropriate title and metadata
  categorize(message: string): ErrorInfo {
    const lowerMessage = message.toLowerCase();

    if (this.isAuthenticationError(lowerMessage)) {
      return {
        category: 'authentication',
        title: 'Login Failed',
        isRetryable: false,
      };
    }

    if (this.isAuthorizationError(lowerMessage)) {
      return {
        category: 'authorization',
        title: 'Access Denied',
        isRetryable: false,
      };
    }

    if (this.isValidationError(lowerMessage)) {
      return {
        category: 'validation',
        title: 'Invalid Input',
        isRetryable: false,
      };
    }

    if (this.isNotFoundError(lowerMessage)) {
      return {
        category: 'not_found',
        title: 'Not Found',
        isRetryable: false,
      };
    }

    if (this.isTimeoutError(lowerMessage)) {
      return {
        category: 'timeout',
        title: 'Request Timeout',
        isRetryable: true,
      };
    }

    if (this.isNetworkError(lowerMessage)) {
      return {
        category: 'network',
        title: 'Connection Error',
        isRetryable: true,
      };
    }

    if (this.isServerError(lowerMessage)) {
      return {
        category: 'server',
        title: 'Server Error',
        isRetryable: true,
      };
    }

    return {
      category: 'unknown',
      title: 'Error',
      isRetryable: false,
    };
  }

  // Gets a user-friendly title for an error message
  getTitle(message: string): string {
    return this.categorize(message).title;
  }

  // Determines if an error is retryable
  isRetryable(message: string): boolean {
    return this.categorize(message).isRetryable;
  }

  // Checks if error is related to authentication
  isAuthenticationError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('credential') ||
      lower.includes('password') ||
      lower.includes('invalid email') ||
      lower.includes('authentication') ||
      lower.includes('unauthorized') ||
      lower.includes('401')
    );
  }

  // Checks if error is related to authorization/permissions
  isAuthorizationError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('forbidden') ||
      lower.includes('permission') ||
      lower.includes('access denied') ||
      lower.includes('403')
    );
  }

  // Checks if error is related to validation
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

  // Checks if error is a not found error
  isNotFoundError(message: string): boolean {
    const lower = message.toLowerCase();
    return lower.includes('not found') || lower.includes('404');
  }

  // Checks if error is a timeout error
  isTimeoutError(message: string): boolean {
    const lower = message.toLowerCase();
    return lower.includes('timeout') || lower.includes('timed out');
  }

  // Checks if error is a network error

  isNetworkError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      lower.includes('network') ||
      lower.includes('connection') ||
      lower.includes('offline') ||
      lower.includes('unable to connect')
    );
  }

  // Checks if error is a server error
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
