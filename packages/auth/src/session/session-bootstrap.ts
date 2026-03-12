import {authApi} from '@sykamore/api-client';
import {
  validateAuthTokens,
  validateIdentity,
  validateTenantMemberships,
  type AuthTokens,
  type TenantMembership,
} from '@sykamore/types';
import {
  authStoreAdapter,
  type CommitAuthenticatedSessionParams,
} from '../core/store-adapter';
import {createInvalidAuthResponseError} from '../core/auth-client-errors';

function resolveSelectedTenantId(
  memberships: TenantMembership[],
  currentTenantId: string | null,
): string | null {
  if (currentTenantId) {
    const existingMembership = memberships.find(
      (membership) => membership.tenant_id === currentTenantId,
    );
    if (existingMembership) {
      return existingMembership.tenant_id;
    }
  }

  const defaultTenant =
    memberships.find((membership) => membership.is_default) ?? memberships[0];
  return defaultTenant?.tenant_id ?? null;
}

export class SessionBootstrapper {
  async establishSession(tokens: AuthTokens): Promise<void> {
    authStoreAdapter.commitAuthenticatedSession(
      await this.bootstrapSession(tokens),
    );
  }

  async restoreSession(tokens: AuthTokens): Promise<boolean> {
    try {
      authStoreAdapter.commitAuthenticatedSession(
        await this.bootstrapSession(tokens),
      );
      return true;
    } catch {
      authStoreAdapter.setAccessToken(null);
      return false;
    }
  }

  private async bootstrapSession(
    tokens: AuthTokens,
  ): Promise<CommitAuthenticatedSessionParams> {
    const validatedTokens = this.validateTokens(tokens);
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

      const currentTenantId =
        authStoreAdapter.getSessionSnapshot().selectedTenantId;

      return {
        user: userResult.data,
        tokens: validatedTokens,
        selectedTenantId: resolveSelectedTenantId(
          membershipsResult.data,
          currentTenantId,
        ),
        memberships: membershipsResult.data,
      };
    } catch (error) {
      authStoreAdapter.setAccessToken(null);
      throw error;
    }
  }

  private validateTokens(tokens: AuthTokens): AuthTokens {
    const tokensResult = validateAuthTokens(tokens);
    if (!tokensResult.success) {
      throw createInvalidAuthResponseError();
    }

    return tokensResult.data;
  }
}
