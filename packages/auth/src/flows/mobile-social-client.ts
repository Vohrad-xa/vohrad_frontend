import {authApi} from '@sykamore/api-client';
import {
  validateMobileSocialLoginParams,
  type AuthTokens,
  type MobileSocialLoginParams,
} from '@sykamore/types';
import {
  createSessionExpiredError,
  createSignInStateError,
} from '../core/auth-client-errors';

export class MobileSocialClient {
  async exchangeProviderToken(
    params: MobileSocialLoginParams,
  ): Promise<AuthTokens> {
    const paramsResult = validateMobileSocialLoginParams(params);
    if (!paramsResult.success) {
      throw createSignInStateError(
        "We couldn't complete social sign-in. Please try again.",
        'INVALID_SOCIAL_SIGN_IN_REQUEST',
      );
    }

    return authApi.exchangeSocialToken({
      provider: paramsResult.data.provider,
      token: paramsResult.data.token,
      userProfile: paramsResult.data.userProfile,
    });
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken.trim()) {
      throw createSessionExpiredError();
    }

    return authApi.refreshSocialToken({refreshToken});
  }
}
