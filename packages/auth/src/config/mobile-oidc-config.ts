import {validateMobileOidcConfig, type MobileOidcConfig} from '@sykamore/types';

let mobileOidcConfig: MobileOidcConfig | null = null;

export function initMobileOidcConfig(config: MobileOidcConfig): void {
  const configResult = validateMobileOidcConfig(config);
  if (!configResult.success) {
    throw new Error('Mobile OIDC configuration is invalid.');
  }

  mobileOidcConfig = configResult.data;
}

export function getMobileOidcClientConfig(): MobileOidcConfig {
  if (!mobileOidcConfig) {
    throw new Error(
      'Mobile OIDC configuration has not been initialized. Call initMobileOidcConfig() during app startup.',
    );
  }

  return mobileOidcConfig;
}
