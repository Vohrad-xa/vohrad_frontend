import {authApi} from '@sykamore/api-client';
import {
  validateAuthTokens,
  validateIdentity,
  validateTenantMemberships,
  type AuthTokens,
} from '@sykamore/types';
import {authStoreAdapter} from '../core/store-adapter';
import {createInvalidAuthResponseError} from '../core/auth-client-errors';

export class SessionBootstrapper {
  async establishSession(tokens: AuthTokens): Promise<void> {
    const tokensResult = validateAuthTokens(tokens);
    if (!tokensResult.success) {
      throw createInvalidAuthResponseError();
    }

    const validatedTokens = tokensResult.data;
    authStoreAdapter.setAccessToken(validatedTokens.access_token);

    try {
      const [user, tenantMemberships] = await Promise.all([
        authApi.getMeProfile(),
        authApi.getMyTenants(),
      ]);

      const userResult = validateIdentity(user);
      if (!userResult.success) {
        throw createInvalidAuthResponseError(
          "We couldn't load your account details.",
          'INVALID_IDENTITY_RESPONSE',
        );
      }

      const membershipsResult = validateTenantMemberships(tenantMemberships);
      if (!membershipsResult.success) {
        throw createInvalidAuthResponseError(
          "We couldn't load your workspace access.",
          'INVALID_MEMBERSHIPS_RESPONSE',
        );
      }

      const defaultTenant =
        membershipsResult.data.find((membership) => membership.is_default) ??
        membershipsResult.data[0];

      authStoreAdapter.commitAuthenticatedSession({
        user: userResult.data,
        tokens: validatedTokens,
        selectedTenantId: defaultTenant?.tenant_id ?? null,
        memberships: membershipsResult.data,
      });
    } catch (error) {
      authStoreAdapter.setAccessToken(null);
      throw error;
    }
  }

  async restoreSession(tokens: AuthTokens): Promise<boolean> {
    const tokensResult = validateAuthTokens(tokens);
    if (!tokensResult.success) {
      return false;
    }

    const validatedTokens = tokensResult.data;
    authStoreAdapter.setAccessToken(validatedTokens.access_token);

    try {
      const user = await authApi.getMeProfile();
      const userResult = validateIdentity(user);
      if (!userResult.success) {
        authStoreAdapter.setAccessToken(null);
        return false;
      }

      authStoreAdapter.commitAuthenticatedSession({
        user: userResult.data,
        tokens: validatedTokens,
      });
      return true;
    } catch {
      authStoreAdapter.setAccessToken(null);
      return false;
    }
  }
}
