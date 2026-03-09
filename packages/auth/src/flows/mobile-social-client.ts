import {authApi} from '@sykamore/api-client';
import type {AuthTokens, MobileSocialLoginParams} from '@sykamore/types';
import {createSessionExpiredError} from '../core/auth-client-errors';

export class MobileSocialClient {
  async exchangeProviderToken(
    params: MobileSocialLoginParams,
  ): Promise<AuthTokens> {
    return authApi.exchangeSocialToken({
      provider: params.provider,
      token: params.token,
      userProfile: params.userProfile,
    });
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken.trim()) {
      throw createSessionExpiredError();
    }

    return authApi.refreshSocialToken({refreshToken});
  }
}
