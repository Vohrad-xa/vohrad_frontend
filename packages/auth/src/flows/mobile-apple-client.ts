import {authApi} from '@sykamore/api-client';
import type {AuthTokens, MobileAppleLoginParams} from '@sykamore/types';
import {createSessionExpiredError} from '../core/auth-client-errors';

export class MobileAppleClient {
  async exchangeIdentityToken(
    params: MobileAppleLoginParams,
  ): Promise<AuthTokens> {
    return authApi.exchangeAppleToken({
      idToken: params.idToken,
    });
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken.trim()) {
      throw createSessionExpiredError();
    }

    return authApi.refreshAppleSession({refreshToken});
  }
}
