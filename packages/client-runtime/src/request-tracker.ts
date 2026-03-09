type RequestActivityListener = (state: RequestActivityState) => void;

export type RequestActivityState = {
  isVisible: boolean;
  activeRequests: number;
  trackedRequests: number;
};

type ConfigOptions = {
  showDelayMs?: number;
  minimumVisibleMs?: number;
};

class RequestTracker {
  private readonly listeners = new Set<RequestActivityListener>();
  private readonly activeRequestIds = new Set<string>();
  private showDelayMs = 300;
  private minimumVisibleMs = 500;
  private isVisible = false;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private lastShowTimestamp: number | null = null;

  recordStarted(requestId: string): void {
    const wasEmpty = this.activeRequestIds.size === 0;
    this.activeRequestIds.add(requestId);

    if (wasEmpty) {
      this.queueShow();
    }

    this.notify();
  }

  recordFinished(requestId: string): void {
    const deleted = this.activeRequestIds.delete(requestId);
    if (!deleted) {
      return;
    }

    if (this.activeRequestIds.size === 0) {
      this.queueHide();
    }

    this.notify();
  }

  subscribe(listener: RequestActivityListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  configure(options: ConfigOptions): void {
    if (typeof options.showDelayMs === 'number') {
      this.showDelayMs = Math.max(0, options.showDelayMs);
    }
    if (typeof options.minimumVisibleMs === 'number') {
      this.minimumVisibleMs = Math.max(0, options.minimumVisibleMs);
    }
  }

  private queueShow(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (this.isVisible) {
      return;
    }

    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (this.showDelayMs === 0) {
      this.setVisible(true);
      return;
    }

    this.showTimer = setTimeout(() => {
      this.setVisible(true);
      this.showTimer = null;
    }, this.showDelayMs);
  }

  private queueHide(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (!this.isVisible) {
      return;
    }

    const timeSinceShow = this.lastShowTimestamp
      ? Date.now() - this.lastShowTimestamp
      : this.minimumVisibleMs;
    const remaining = Math.max(this.minimumVisibleMs - timeSinceShow, 0);

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (remaining <= 0) {
      this.setVisible(false);
      return;
    }

    this.hideTimer = setTimeout(() => {
      this.setVisible(false);
      this.hideTimer = null;
    }, remaining);
  }

  private setVisible(nextVisible: boolean): void {
    if (this.isVisible === nextVisible) {
      return;
    }

    this.isVisible = nextVisible;
    this.lastShowTimestamp = nextVisible ? Date.now() : null;
    this.notify();
  }

  private getState(): RequestActivityState {
    return {
      isVisible: this.isVisible,
      activeRequests: this.activeRequestIds.size,
      trackedRequests: this.activeRequestIds.size,
    };
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }
}

export const requestTracker = new RequestTracker();
