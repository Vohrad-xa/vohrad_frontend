import {httpClient} from '@sykamore/api-client';
import {useAuthStore} from '@sykamore/store';
import type {AuthTokens, Identity, TenantMembership} from '@sykamore/types';

export type AuthSessionSnapshot = {
  tokens: AuthTokens | null;
  selectedTenantId: string | null;
};

export type CommitAuthenticatedSessionParams = {
  user: Identity;
  tokens: AuthTokens;
  selectedTenantId?: string | null;
  memberships?: TenantMembership[];
};

class AuthStoreAdapter {
  setLoading(loading: boolean): void {
    useAuthStore.getState().setLoading(loading);
  }

  getTokens(): AuthTokens | null {
    return useAuthStore.getState().tokens;
  }

  getSessionSnapshot(): AuthSessionSnapshot {
    const state = useAuthStore.getState();
    return {
      tokens: state.tokens,
      selectedTenantId: state.selectedTenantId,
    };
  }

  subscribeSession(listener: (snapshot: AuthSessionSnapshot) => void): () => void {
    let lastSnapshot = this.getSessionSnapshot();

    return useAuthStore.subscribe((state) => {
      const nextSnapshot: AuthSessionSnapshot = {
        tokens: state.tokens,
        selectedTenantId: state.selectedTenantId,
      };

      if (
        nextSnapshot.tokens === lastSnapshot.tokens &&
        nextSnapshot.selectedTenantId === lastSnapshot.selectedTenantId
      ) {
        return;
      }

      lastSnapshot = nextSnapshot;
      listener(nextSnapshot);
    });
  }

  syncHttpClientFromSnapshot(snapshot: AuthSessionSnapshot): void {
    httpClient.setAccessToken(snapshot.tokens?.access_token ?? null);
    httpClient.setTenantId(snapshot.selectedTenantId ?? null);
  }

  syncHttpClientFromStore(): void {
    this.syncHttpClientFromSnapshot(this.getSessionSnapshot());
  }

  setAccessToken(accessToken: string | null): void {
    httpClient.setAccessToken(accessToken);
  }

  commitAuthenticatedSession({
    user,
    tokens,
    selectedTenantId,
    memberships,
  }: CommitAuthenticatedSessionParams): void {
    httpClient.setAccessToken(tokens.access_token);
    if (selectedTenantId !== undefined) {
      httpClient.setTenantId(selectedTenantId ?? null);
    }

    useAuthStore.setState((state) => ({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      retryCallback: null,
      selectedTenantId:
        selectedTenantId === undefined
          ? state.selectedTenantId
          : selectedTenantId,
      memberships: memberships ?? state.memberships,
    }));
  }

  updateTokens(tokens: AuthTokens | null): void {
    httpClient.setAccessToken(tokens?.access_token ?? null);
    useAuthStore.setState({tokens});
  }

  resetSession(): void {
    httpClient.setAccessToken(null);
    httpClient.setTenantId(null);
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      intendedRoute: null,
      isLoading: false,
      error: null,
      retryCallback: null,
      selectedTenantId: null,
      memberships: [],
    });
  }
}

export const authStoreAdapter = new AuthStoreAdapter();
